docker build -t plco:dev -f docker/plco.dockerfile .
docker run -p 9000:9000 -v $PWD:/deploy plco:dev