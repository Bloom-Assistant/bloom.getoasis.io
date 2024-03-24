import os
from fastapi import FastAPI, Body
from llama_index.agent.openai import OpenAIAgent
from llama_index.embeddings.voyageai import VoyageEmbedding
from llama_index.llms.anthropic import Anthropic
from llama_index.vector_stores.astra_db import AstraDBVectorStore
from llama_index.core.composability import ComposableGraph
from llama_index.tools.salesforce import SalesforceToolSpec
from llama_index.tools.slack import SlackToolSpec
from llama_index.tools.graphql import GraphQLToolSpec
from llama_index.core import Settings
from dotenv import load_dotenv


app = FastAPI()
# Initialize LlamaIndex
embed_model_name = "voyage-large-2"
voyage_api_key = os.environ.get("VOYAGE_API_KEY")
embed_model = VoyageEmbedding(
    model_name=embed_model_name, voyage_api_key=voyage_api_key
)
load_dotenv()

ASTRA_DB_APPLICATION_TOKEN = os.environ.get("ASTRA_DB_APPLICATION_TOKEN")
ASTRA_DB_API_ENDPOINT = os.environ.get("ASTRA_DB_API_ENDPOINT")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

anthropic = Anthropic(temperature=0.7, api_key=os.environ.get("ANTHROPIC_API_KEY"))
Settings.llm = anthropic
composable_graph = ComposableGraph(all_indices={}, root_id="root")

# Define the agent as a global variable
agent = None

def insert_data_into_graph(data):
    node = composable_graph.insert(data)
    composable_graph.build_index_from_nodes([node])

def create_tool_specs(data):
    salesforce_params = data.get("salesforce", {})
    username = salesforce_params.get("username")
    password = salesforce_params.get("password")
    security_token = salesforce_params.get("security_token")
    consumer_key = salesforce_params.get("consumer_key")
    consumer_secret = salesforce_params.get("consumer_secret")
    salesforce_tool_spec = SalesforceToolSpec(
        username=username,
        password=password,
        security_token=security_token,
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
    ) if all([username, password, security_token, consumer_key, consumer_secret]) else None

    slack_params = data.get("slack", {})
    slack_token = slack_params.get("slack_token")
    slack_tool_spec = SlackToolSpec(slack_token=slack_token) if slack_token else None

    graphql_params = data.get("graphql", {})
    url = graphql_params.get("url")
    headers = graphql_params.get("headers")
    graphql_tool_spec = GraphQLToolSpec(url=url, headers=headers) if url and headers else None

    return [tool_spec for tool_spec in [salesforce_tool_spec, slack_tool_spec, graphql_tool_spec] if tool_spec]

@app.post("/ingest")
def ingest(data: dict = Body(...)):
    organization = data.get("organization", "default")
    tool = data.get("tool", "default")

    # Create a new AstraDBVectorStore instance with the provided organization and tool
    astra_db_store = AstraDBVectorStore(
        token=ASTRA_DB_APPLICATION_TOKEN,
        api_endpoint=ASTRA_DB_API_ENDPOINT,
        namespace=organization,
        collection_name=tool,
        embedding_dimension=1536,
    )

    # Update the Settings.vector_store with the new AstraDBVectorStore instance
    Settings.vector_store = astra_db_store

    tool_specs = create_tool_specs(data)
    global agent
    agent = OpenAIAgent.from_tools([tool_spec.to_tool_list() for tool_spec in tool_specs])
    insert_data_into_graph(data)
    return {"message": "Data ingested successfully."}

@app.post("/query")
def query(query: str = Body(..., embed=True)):
    global agent
    # Use the agent to query the knowledge graph and tools
    response = agent.query(query)
    return {"response": response.response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)