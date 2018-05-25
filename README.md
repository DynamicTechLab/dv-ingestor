# dv-ingestor

## 1. Introduction

A microservice that is writing data to ES. We use the docker container to hold the environment so that npm does not need to install in your local environment.

> Prerequisite:
>
> * Install Docker: https://www.docker.com/get-docker
> * For convenience, you may want to add docker cli as first-class citizen in your terminal: https://docs.docker.com/install/linux/linux-postinstall/

> Note:
> All of our command based on Linux/Mac

## 2. IDE

I personally recommend VS Code. Make sure you've installed several extension to better development experience
|Plugin|Description|
|---|---|
|Eslint|https://github.com/Microsoft/vscode-eslint|
|Prettier|https://github.com/prettier/prettier-vscode|

## 3. The Easy Way: Start all service with script

Just run

```shell
./helper.sh
```

Then Open your browser and hit localhost:3000, you should be able to see the server up message. 
> BTW
> We use nodemon for hot-deploy, so any change you made for code will immediately reflect in server. So you don't need to 
> start and stop server, most of the time.

Open another tab and hit localhost:5601, you will access the Kibana

> Important!
> Whenever you modify the Dockerfile, you have to rebuild the image, to trigger that through script, you need to use the command:
>
> ```shell
> docker rmi dv-ingestor
> ```
>
> The command will remove the current build image so that the script will detect that and build a new image
> TODO: Move build image to a separate command!

## 4. The Hard Way: Start Ingestor Connect with ElasticSearch Using Docker

1.  Create a customized network

```shell
docker network create dv_ingestor_network --driver=bridge
```

2.  Bootstrap a Elastic Search server by using docker:

```shell
docker run -d --rm --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --network dv_ingestor_network docker.elastic.co/elasticsearch/elasticsearch:6.2.4
```

3.  Build the docker image, run the command in your _repository root_:

```shell
docker build -f dev/Dockerfile -t dv-ingestor --build-arg DEV_HOME=$(pwd) .
```

4.  Run the docker image with command:

```shell
docker run --rm --name dv-ingestor -v $(pwd):$(pwd) -p 3000:3000 --network dv_ingestor_network dv-ingestor
```

5.  View the ES through Kibana

```shell
docker run -d --rm --name kibana -p 5601:5601 --network dv_ingestor_network docker.elastic.co/kibana/kibana:6.2.4
```

## 5. How to use Kibana

In the Navigation Bar, find the Dev Tools, input the following snippet

```
GET /yow/_search
{
  "query": {
    "match_all": {}
  }
}
```

This will display all of the records under index yow

## 6. Debug the app

### 6.1 Debug through Chrome

1.  Open chrome and go to chrome://inspect/#devices
2.  Click _Open dedicated DevTools for Node_ and a new DevTool window will popup.
3.  Click Source Tab and use Mac shortcut Command+P to search app.js
4.  You can set breakpoint in the file and when you reload the app in browser it should hit the breakpoint.

### 6.2 Debug through VS Code

Haven't figure out yet...

## 7. What is next?...

Some useful command:

curl -X POST "localhost:9200/yow/\_delete_by_query" -H 'Content-Type: application/json' -d'
{
"query": {
"match_all": {}
}
}
'

http://127.0.0.1:9200/yow/_search?pretty=true&q=*:*

http://localhost:3000/read?fileName=data

## 8. Q&A

Q1. I can't connect my app with elastic search.
A1: We create a isolated bridge network for docker containers, so they use the container name as alias to connect with each other
