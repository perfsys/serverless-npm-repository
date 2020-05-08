#!/usr/bin/env bash

# TODO replace this
export AWS_PROFILE=perfsys
export NPM_REGISTRY_S3_NAME=perfsys-npm-registry-1

#NPM_REGISTRY_S3_NAME=$NPM_REGISTRY_S3_NAME sls deploy -v

# TODO may need to do `s3 sync` or remove all file before
aws s3 rm --recursive s3://$NPM_REGISTRY_S3_NAME/
aws s3 cp --recursive  ./data/ s3://$NPM_REGISTRY_S3_NAME/

# List S3 bucket content
aws s3 ls $NPM_REGISTRY_S3_NAME


