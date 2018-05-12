# dv-ingestor
## 1. Introduction
A microservice that is writing data to ES. We use the docker container to hold the environment so that npm does not need to install in your local environment.

> Prerequisite:
> - Install Docker: https://www.docker.com/get-docker
> - For convenience, you may want to add docker cli as first-class citizen in your terminal: https://docs.docker.com/install/linux/linux-postinstall/

> Note:
> All of our command based on Linux/Mac 

## 2. Start Ingestor Connect with ElasticSearch Using Docker
1. Create a customized network
```shell
docker network create dvnetwork --driver=bridge
``` 
2. Bootstrap a Elastic Search server by using docker:
```shell
docker run -d --rm --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --network dvnetwork docker.elastic.co/elasticsearch/elasticsearch:6.2.4
```
3. Build the docker image, run the command in your *repository root*:
```shell
docker build -f dev/Dockerfile -t dv-ingestor-dev --build-arg DEV_HOME=$(pwd) .
```
4. Run the docker image with command:
```shell
docker run --rm --name dv-ingestor -v $(pwd):$(pwd) -p 3000:3000 --network dvnetwork dv-ingestor-dev
```
Then Open your browser and hit localhost:3000, you should be able to see the hello world!

5. View the ES through Kibana
```shell
docker run -d --rm --name kibana -p 5601:5601 --network dvnetwork docker.elastic.co/kibana/kibana:6.2.4
```

TO BE CONTINUE...
Some useful command:

curl -X POST "localhost:9200/yow/_delete_by_query" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}
'

http://127.0.0.1:9200/yow/_search?pretty=true&q=*:*

http://localhost:3000/read?fileName=data
