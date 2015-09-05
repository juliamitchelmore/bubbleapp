#!/bin/sh
echo Checking AWS CLI
if ! type "aws" > /dev/null; then
echo Installing AWS CLI
curl https://s3.amazonaws.com/aws-cli/awscli-bundle.zip > /tmp/awscli-bundle.zip
unzip /tmp/awscli-bundle.zip -d /tmp
cd /tmp/awscli-bundle
sudo .install
rm -R awscli-bundle  
fi
echo OK


