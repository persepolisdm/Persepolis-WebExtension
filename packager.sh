#!/bin/bash
EXPATH="WebExtension"

# Backup dev manifest.json
mv ./$EXPATH/manifest.json manifest_dev.json

#Create firefox package, which expects all files directly
cp firefox_manifest.json $EXPATH/manifest.json

rm -f ./firefox.zip
cd ./$EXPATH/
zip ../firefox.zip * -r
cd ..

cp chrome_manifest.json WebExtension/manifest.json
rm -f ./chrome.zip
zip chrome.zip $EXPATH/ -r

# Restore dev mainfest.json
mv manifest_dev.json ./$EXPATH/manifest.json
