// Requetes http (appels a des api)
var http = require('http');

// Express, framework de gestion des routes
var Express = require('express');
var server = Express();

// Get client device and ip
var expressip = require('express-ip');
var device = require('express-device');

// Framework générateur de noms aléatoires
var random_name = require('node-random-name');

// Ecrire en couleurs dans la console
var colors = require('colors');

// Middleware qui gère les sessions
var session = require('cookie-session');

// Middleware pour le favicon
var favicon = require('serve-favicon');

// Stocker les dates
var date = new Date();

// VARIABLES //
var port = 8080;
//var port = process.env.PORT;
var msg_device, msg1_chaud, msg1_froid, msg2, msg3, msg4, msg5;
msg1_chaud = "C'est chaud. ";
msg1_froid = "Ce n'est pas chaud, continuez votre misérable vie.";
msg2 = "Bravo, vous avez rafraichi... la page.";
msg3 = "Il ne se passera rien en continuant a rafraîchir ;)";
msg4 = "Il faut vraiment s'ennuyer pour faire ça..";
msg5 = "Puisque vous continuez, on va ajouter une pub sur la page à chaque rafraichissement. Si ça, ça ne vous refroidit pas !";

var msg = ["message lambda", msg2, msg3, msg4, msg5];

// Utilisation des middlewares
server.use(device.capture())
.use(expressip().getIpInfoMiddleware)
.use(favicon(__dirname+'/public/favicon.ico'))
.use(session({
  name: 'session',
  keys: ['key1', 'key2']
}));

// var villes = [];
// console.log(villes);

server.get('',function(req,res){
    var ipInfo = req.ipInfo;
    //console.log('\n');
    
    console.log(date.getHours() + 'h' + date.getMinutes());
    
    if(req.session.name == undefined) {
        req.session.name = random_name();
        req.session.time = 1;
    
        console.log('New visitor ! We\'ll call him "' + req.session.name.yellow + '".');
        console.log('CITY : '.yellow + ipInfo.city);
        console.log('DEVICE : '.yellow + req.device.type);
        
    } else {
        // req.session.name = 'Colin Geindre - local tester'
        req.session.time += 1;
        console.log(req.session.name.green + ' just logged again from ' + '\x1b[33m%s\x1b[0m', ipInfo.city + ', on ' + req.device.type.yellow +'. Its time n°' + req.session.time);
        console.log('He camed to see : ' + req.url.yellow);
    }
    
    // GET WEATHER IN CLIENT TOWN
    http.get('http://api.openweathermap.org/data/2.5/weather?q='+ ipInfo.city +',fr&appid=36c2a73dd80e36cc1c36eab251bbf29e', (resp) => {
        let data ='';
   
        resp.on('data', (chunk) => {
            data += chunk; 
        }); 
   
        resp.on('end', () => {
            
            if(parseInt(JSON.parse(data).cod) == 200 && ipInfo.city!=undefined) {
                console.log('CODE : '.yellow + JSON.parse(data).cod.toString().green);
                console.log('TEMP : '.yellow + JSON.parse(data).main.temp);
            
                var meteo = parseFloat(JSON.parse(data).main.temp)-273.5;
                meteo = Math.round(meteo*10)/10;
                
                // TEST - Random meteo
                //meteo = Math.round((Math.random()-0.1)*50);
            
                var red = meteo/40*240 + 15;
                var blue = 255-red;
                if(meteo>25) {
                    var green = 55;
                } else {
                    var green = 75;
                }
                
                // Adaptation du message en fonction du devicee du client
                if(req.device.type == 'desktop') {
                    msg_device = "Appuyez sur F5 pour rafraîchir."
                } else {
                    msg_device = "Faîtes glisser vers le bas pour rafraîchir."
                }
            
                var ville = 'A '+ JSON.parse(data).name+'.';
                
                if(req.session.time==1) {
                    if(meteo>=25) {
                        var premierMsg = msg1_chaud;
                    } else {
                        var premierMsg = msg1_froid;
                        msg_device = "";
                        console. log(">>> Destroying session of ".red + req.session.name.yellow + "... (cause: 'trop froid')\n".red);
                        req.session = null;
                    }
                } else if(req.session.time<5) {
                    var premierMsg = msg[req.session.time-1];
                } else {
                    var premierMsg = msg5;
                    console. log(">>> Destroying session of ".red + req.session.name.yellow + "... (cause: '5eme reload')\n".red);
                    req.session = null;
                }
            
                res.render('index.ejs',{weather:meteo, town:ville, rouge:red, bleu:blue, vert:green, string1:premierMsg, string2:msg_device});
               
            } else {
                console.log('Imposible de localiser précisément '.red + req.session.name.yellow);
                http.get('http://api.openweathermap.org/data/2.5/weather?q='+ undefined +',fr&appid=36c2a73dd80e36cc1c36eab251bbf29e', (resp) => {
                    let data ='';
   
                    resp.on('data', (chunk) => {
                        data += chunk; 
                    }); 
   
                    resp.on('end', () => {
            
                        console.log('CODE : '.yellow + JSON.parse(data).cod.toString().green);
                        console.log('TEMP : '.yellow + JSON.parse(data).main.temp);
            
                        var meteo = parseFloat(JSON.parse(data).main.temp)-273.5;
                        meteo = Math.round(meteo*10)/10;
                
                        var red = meteo/40*240 + 15;
                        var blue = 255-red;
                        if(meteo>25) {
                            var green = 55;
                        } else {
                            var green = 75;
                        }
                
                        // Adaptation du message en fonction du devicee du client
                        if(req.device.type == 'desktop') {
                            msg_device = "Appuyez sur F5 pour rafraîchir."
                        } else {
                            msg_device = "Faîtes glisser vers le bas pour rafraîchir."
                        }
                        
                        var ville = 'En France.';
                
                        if(req.session.time==1) {
                            if(meteo>=25) {
                                var premierMsg = msg1_chaud;
                            } else {
                                var premierMsg = msg1_froid;
                                msg_device = "";
                                console. log(">>> Destroying session of ".red + req.session.name.yellow + "... (cause: 'trop froid')\n".red);
                                req.session = null;
                            }
                        } else if(req.session.time<5) {
                            var premierMsg = msg[req.session.time-1];
                        } else {
                            var premierMsg = msg5;
                            console. log(">>> Destroying session of ".red + req.session.name.yellow + "... (cause: '5eme reload')\n".red);
                            req.session = null;
                        }
            
                        res.render('index.ejs',{weather:meteo, town:ville, rouge:red, bleu:blue, vert:green, string1:premierMsg, string2:msg_device});
                    });
                });
            }
            //console.log('\n');
        });
    }).on('error', (err) => {
        console.log("ERROR: " + err.message);
    }); 
})
.get('/:page',function(req,res){
    res.redirect('/');
})
.use(function(req,res,next){
    res.setHeader('Content-Type','texxt/plain');
    res.status(404).send('Too far for us :/');
});

server.listen(port);
console.info('Server started on port '+port+'\n');