module.exports = function() {


    //Register new server
    global.app.post('/server/register',function(req,res){

        try{
        	var data = req.body || {};                 

            if(data.secureKey){
                global.serverService.registerCluster(data.secureKey).then(function(result){
                   return res.status(200).json(result);
                }, function(error){           
                    return res.status(400).send(error);
                });
            }else{
                return res.send(400, "Unauthorized");
            }
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        }

    });


   //know server isHosted?
    global.app.post('/server/isHosted',function(req,res){

        try{
            var data = req.body || {}; 

            if(data.secureKey){

                if(data.secureKey==global.keys.hostedSecureKey){
                    return res.status(200).send(true);
                }else{
                    return res.status(200).send(false);
                }

            }else{
                return res.send(400, "Bad Request");
            } 
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        }       

    });

    global.app.get('/status', function(req,res,next) {

        console.log("MongoDb Status..");

        var promises=[];      

        promises.push(_mongoDbStatus());       

        q.all(promises).then(function(resultList){
            if(resultList && resultList[0]){
                return res.status(200).json({status:200, message : "Service Status : OK"});
            }else{
                return res.status(500).send("Something went wrong!");
            }
        },function(error){
            return res.status(500).send("Something went wrong!");
        });
                  
    });

    
};

function _mongoDbStatus(){

    console.log("MongoDB Status Function...");

    var deferred = q.defer();

    try{

        global.mongoClient.command({ serverStatus: 1},function(err, status){
          if(err) { 
            console.log(err);
            deferred.reject(err);                                    
          }

          console.log("MongoDB Status:"+status.ok);
          if(status && status.ok===1){         
            deferred.resolve("Ok");                                              
          }else{        
            deferred.reject("Failed");
          }
        });

    }catch(err){
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
    }

    return deferred.promise;
}
