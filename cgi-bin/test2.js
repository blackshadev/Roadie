var fs = require("fs");
response.setHeader("test","test");
var cookie = setCookie("testval2","Testval2");
print("Set cookie lifetime to: " + cookie.setLifeTime("2days 5minutes 9secs") + "<br />");
print("<br />Client headers: <hr />");
print(client.all());
print("<br /><hr />Okey beter dat dit werkt");
response.compressResponse(true);