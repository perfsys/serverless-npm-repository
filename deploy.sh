#!/usr/bin/env bash

# TODO AWS profile, name, region
export AWS_PROFILE=perfsys
export NPM_REGISTRY_NAME=perfsys-npm-repo
export NPM_REGISTRY_REGION=us-east-1

# Deploying the Serverless project to a AWS account
NPM_REGISTRY_NAME=$NPM_REGISTRY_NAME \
NPM_REGISTRY_REGION=$NPM_REGISTRY_REGION \
sls deploy -v

# Copying test data to AWS S3 bucket
aws s3 rm --recursive s3://$NPM_REGISTRY_NAME-artifacts/
aws s3 cp --recursive  ./data/ s3://$NPM_REGISTRY_NAME-artifacts/

# List S3 bucket content
aws s3 ls s3://$NPM_REGISTRY_NAME-artifacts/


