#!/bin/bash
EXPATH="WebExtension"

#Create firefox package, which expects all files directly
cp firefox_manifest.json $EXPATH/manifest.json


rm -f ./firefox.zip
cd ./$EXPATH/
zip ../firefox.zip * -r
cd ..


cp chrome_manifest.json WebExtension/manifest.json
rm -f ./chrome.zip
zip chrome.zip $EXPATH/ -r
