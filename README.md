# dashboard

Some useful command:

sudo docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.2.4

curl -X POST "localhost:9200/yow/_delete_by_query" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}
'

http://127.0.0.1:9200/yow/_search?pretty=true&q=*:*

http://localhost:3000/read?fileName=data
