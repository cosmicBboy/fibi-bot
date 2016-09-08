# FIBI

## Setup

Make sure you install the [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)

Configure your fibidev profile:
```
aws configure --profile fibidev
AWS Access Key ID [None]: <my_access_key_id>
AWS Secret Access Key [None]: <my_secret_access_key>
Default region name [None]: us-east-1
Default output format [None]: json
```

## Build Options

- create the lambda function with `make create NAME=<bot_name>`
- deploy to production with`make deploy-prod`
- deploy to development with `make deploy-dev`
- run local tests `make tests`
