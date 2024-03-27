import os
from joblib import Memory
from llama_index.agent.openai import OpenAIAgent
from fastapi import FastAPI, Body, HTTPException
from llama_index.llms.openai import OpenAI
from llama_index.tools.salesforce import SalesforceToolSpec
from llama_index.tools.slack import SlackToolSpec
from llama_index.tools.graphql import GraphQLToolSpec
from llama_index.llms.anthropic import Anthropic
from llama_index.core import PromptTemplate
from dotenv import load_dotenv
from llama_index.tools.database import DatabaseToolSpec
from pydantic import BaseModel
from typing import Optional



# Define a Pydantic model for your request body
class RequestBody(BaseModel):
    sf_username: Optional[str] = None
    sf_password: Optional[str] = None
    sf_consumer_key: Optional[str] = None
    sf_consumer_secret: Optional[str] = None
    gql_url: Optional[str] = None
    scheme: Optional[str] = None
    host: Optional[str] = None
    port: Optional[str] = None
    user: Optional[str] = None
    password: Optional[str] = None
    dbname: Optional[str] = None
    slack_token: Optional[str] = None
    chat: str

app = FastAPI()
llm: OpenAI = OpenAI(temperature=0, model="gpt-3.5-turbo-0613")

@app.post("/query")
async def query_endpoint(body: RequestBody):
    tools = []

    if body.sf_username and body.sf_password and body.sf_consumer_key and body.sf_consumer_secret:
        sf = SalesforceToolSpec(
            username=body.sf_username,
            password=body.sf_password,
            consumer_key=body.sf_consumer_key,
            consumer_secret=body.sf_consumer_secret,
            domain="test",
        )
        tools.extend(sf.to_tool_list())

    if body.gql_url:
        gql = GraphQLToolSpec(
            url=body.gql_url,
            headers={
                "content-type": "application/json",
            },
        )
        tools.extend(gql.to_tool_list())

    if body.scheme and body.host and body.port and body.user and body.password and body.dbname:
        db_tools = DatabaseToolSpec(
            scheme=body.scheme,  # Database Scheme
            host=body.host,  # Database Host
            port=body.port,  # Database Port
            user=body.user,  # Database User
            password=body.password,  # Database Password
            dbname=body.dbname,  # Database Name
        )
        tools.extend(db_tools.to_tool_list())

    if body.slack_token:
        slack = SlackToolSpec(slack_token=body.slack_token)
        tools.extend(slack.to_tool_list())

    system_prompt = "You are a helpful assistant that can answer questions using information from various tools such as Salesforce, GraphQL, Slack, and databases. You should use the tools provided to you to answer the user's question as accurately as possible."

    agent = OpenAIAgent.from_tools(tools, system_prompt=system_prompt, llm=llm, verbose=True)

    try:
        response = agent.chat(body.chat)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
app.debug = True