var fs = require("fs");
setHeader("test","test");
var cookie = setCookie("testval2","Testval2");
print("Set cookie lifetime to: " + cookie.setLifeTime("2days 5minutes 9secs") + "<br />");
print("<br />Client headers: <hr />");
print(getClientHeaders());
print("<br /><hr />Okey beter dat dit werkt");
compressResponse(true);