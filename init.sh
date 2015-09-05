#!/bin/sh
echo Checking AWS CLI
if ! type "aws" > /dev/null; then
echo Installing AWS CLI
curl https://s3.amazonaws.com/aws-cli/awscli-bundle.zip > /tmp/awscli-bundle.zip
unzip /tmp/awscli-bundle.zip 
sudo ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws
rm -R awscli-bundle  
fi
echo OK


