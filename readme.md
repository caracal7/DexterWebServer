
# Dexter embedded server

### Why?

Because maybe we need:
- SSL encryption and authentication
- Permissions for everything(control/monitoring & etc)
- Modern scalable server design(message broker & microservices)
- Realtime JSON sync
- Pub/Sub
- MQTT

### Folder structure


- /certs - SSL certificates
- /messageBroker - message broker & permissions
- /microservices - everything is here :)
- /static - folder with static files served at Dexter IP https://xxx.xxx.xxx.xxx/
- /tools - some useful tools/utils
- /webServer - HTTPS server for serve static(also can be used for REST services but we don't need REST because we have RPC)


### Installation

1. Backup `/srv/samba/share/www` (For ex. to folder to `/srv/samba/share/www.backup`)
2. Unpack or clone this repository to `/srv/samba/share/www`
3. Make `npm install` in `/srv/samba/share/www`
4. Set Dexter IP in `/srv/samba/share/www/config.js`
5. Replace in `/srv/samba/share/RunDexRun`
```
#start the local web server
node www/httpd &
```
with
```
echo "=====*****(((((((((((((( Javascript ))))))))))))))*****====="
echo "Start the message broker"
node www/messageBroker/start &
echo "Sleep for 15 seconds"
sleep 15
echo "Wake up :)"
echo "Start the local web server & microservices manager"
node www/webServer/start &
```
6. Reboot dexter
7. Go to https://xxx.xxx.xxx.xxx/ (For ex. https://192.168.0.142/)


### API

... maybe someone help me to describe API? :)
