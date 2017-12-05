
  var s3url_head = "https://console.amazonaws.cn/s3/buckets/adas-datacollection-bucket/";
  var s3url_end = "/?region=cn-north-1";

  var cars_proto = [];
  var cars = [];

  cars_proto["0"] = {color:"#8B8989", lon:0, lat:0, active:0};
  cars_proto["1"] = {color:"#00F5FF", lon:0, lat:0, active:0};
  cars_proto["2"] = {color:"#4169E1", lon:0, lat:0, active:0};
  cars_proto["3"] = {color:"#458B00", lon:0, lat:0, active:0};
  cars_proto["4"] = {color:"#EE7600", lon:0, lat:0, active:0};
  cars_proto["5"] = {color:"#9932CC", lon:0, lat:0, active:0};
  cars_proto["6"] = {color:"#BA55D3", lon:0, lat:0, active:0};
  cars_proto["7"] = {color:"#FFB90F", lon:0, lat:0, active:0};
  cars_proto["8"] = {color:"#FF7F00", lon:0, lat:0, active:0};
  cars_proto["9"] = {color:"#EE0000", lon:0, lat:0, active:0};

  cars["test"] = cars_proto["0"];

  var cars_icon = [];
  var cars_icon_proto = [];
  cars_icon["park"] = new BMap.Icon("images/ppp.png", new BMap.Size(64, 64), {imageOffset: new BMap.Size(0, 0)});
  cars_icon["test"] = new BMap.Icon("images/s1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});

  cars_icon_proto["0"] = new BMap.Icon("images/s1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["1"] = new BMap.Icon("images/b1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["2"] = new BMap.Icon("images/b2.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["3"] = new BMap.Icon("images/g1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["4"] = new BMap.Icon("images/o1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["5"] = new BMap.Icon("images/p1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["6"] = new BMap.Icon("images/p2.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["7"] = new BMap.Icon("images/y1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["8"] = new BMap.Icon("images/y2.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});
  cars_icon_proto["9"] = new BMap.Icon("images/r1.png", new BMap.Size(48, 48), {imageOffset: new BMap.Size(0, 0)});

	var linesPoints = null;
	var map = new BMap.Map("allmap");
	//map.centerAndZoom(new BMap.Point(116.739, 39.739), 11);
	map.centerAndZoom(new BMap.Point(121.479, 31.235), 11);
	map.addControl(new BMap.MapTypeControl());
	//map.setCurrentCity("北京");
	map.setCurrentCity("上海");
	map.enableScrollWheelZoom(true);
  map.addControl(new BMap.ScaleControl());
  //map.setMapStyle({style:'googlelite'});
  map.setMapStyle({
    styleJson:[
      {
        "featureType": "highway",
        "elementType": "geometry",
        "stylers": {
          "color": "#f3f3f3",
          "weight": "0.8"
        }
      },
      {
        "featureType": "railway",
        "elementType": "all",
        "stylers": {
          "visibility": "off"
        }
      },
      {
        "featureType": "local",
        "elementType": "labels",
        "stylers": {
          "visibility": "off"
        }
      },
      {
        "featureType": "land",
        "elementType": "all",
        "stylers": {
          "color": "#ffdada"
        }
      },
      {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": {
          "visibility": "off"
        }
      },
      {
        "featureType": "water",
        "elementType": "all",
        "stylers": {
          "color": "#c9eeff"
        }
      }
    ]
  });
  
  var car_mark = [];
  var car_park = [];

  var socket = io('http://adasgps.horizon-robotics.com:9090');

  getFileFromServer("cars_list", function(text, cars_list_var) {
    if (text === null) {
      // An error occurred
    }
    else {
      // `text` is the file text
      var cars_list = text.split('\n'); // get history coordinates array.
      for (var i = 0, len = cars_list.length - 1; i < len; i++) {
        var car_mac = cars_list[i];
        var mod_id = Number(car_mac[11]) % 10;
        cars[car_mac] = cars_proto[mod_id.toString()];
        cars_icon[car_mac] = cars_icon_proto[mod_id.toString()];
      }
      for (var key in cars) {
        getFileFromServer(key, function(text, key) {
          if (text === null) {
            // An error occurred
          }
          else {
            // `text` is the file text
            var coors = text.split('\n'); // get history coordinates array.
            var interval = 10;
            var last_coor;
            for (var i = interval, len = coors.length; i < len - 1; i += interval) {

              // /*
              // hack baidu coor convert.
              var start_arr = Wgs84ToBd09(Number((coors[i - interval].split(","))[0]), Number((coors[i - interval].split(","))[1]));
              var end_arr = Wgs84ToBd09(Number((coors[i].split(","))[0]), Number((coors[i].split(","))[1]));
              var dist = distance(start_arr[0], start_arr[1], end_arr[0], end_arr[1]);
              // revise deviate coordinate.
              if (dist > 1000) {
                continue;
              }
              var start_point = new BMap.Point(start_arr[0], start_arr[1]);
              var end_point = new BMap.Point(end_arr[0], end_arr[1]);
              DrawLine(key, start_point, end_point);
              last_coor = end_point;
              // */

               /*
              // use baidu coor convert.
              var pointArr = [];
              var convertor = new BMap.Convertor();
              pointArr.push(new BMap.Point(Number((coors[i - interval].split(","))[0]), Number((coors[i - interval].split(","))[1])));
              pointArr.push(new BMap.Point(Number((coors[i].split(","))[0]), Number((coors[i].split(","))[1])));
              //alert(pointArr[0].lng + "," + pointArr[0].lat);
              //alert(pointArr[1].lng + "," + pointArr[1].lat);
              convertor.translate(pointArr, 1, 5, translateCallback);
              // */
 
            }
            if (cars[key].active === 0) {
   	          car_park[key] = new BMap.Marker(
                                    last_coor,
   	                               {icon:cars_icon["park"]});
              car_park[key].addEventListener("click", function attribute(e) {
                var p = e.target;
                //alert("marker的位置是" + p.getPosition().lng + "," + p.getPosition().lat);
                var s3url = s3url_head + key + s3url_end;
                window.open(s3url);
              });
   	          map.addOverlay(car_park[key]);
            }
          }
        });
      } 
    }
  });

  socket.on('online', function (data) {
    var str = data;
    var devid = (str.split(","))[0];
    cars[devid].active = 1;
	  if (car_park[devid]) {
	    map.removeOverlay(car_park[devid]);
	  }
  });

  socket.on('offline', function (data) {
    var str = data;
    var devid = (str.split(","))[0];
    cars[devid].active = 0;
    if (car_mark[devid]) {
      var p = car_mark[devid].getPosition();
	    car_park[devid] = new BMap.Marker(
                            p,
	                          {icon:cars_icon["park"]});
      car_park[devid].addEventListener("click", function attribute(e) {
        var p = e.target;
        //alert("marker的位置是" + p.getPosition().lng + "," + p.getPosition().lat);
        var s3url = s3url_head + devid + s3url_end;
        window.open(s3url);
      });
	    map.removeOverlay(car_mark[devid]);
	    map.addOverlay(car_park[devid]);
    }
  });

  socket.on('active_num', function (data) {
    var activenum = data;
    document.getElementById("activenum").innerHTML = activenum;
  });

  socket.on('gps', function (data) {
    var str = data;
    var devid = (str.split(","))[0];
    var lon_end = (str.split(","))[1];
    var lat_end = (str.split(","))[2];

    if (!cars.hasOwnProperty(devid)) {
      var mod_id = Number(devid[11]) % 10;
      cars[devid] = cars_proto[mod_id.toString()];
      cars_icon[devid] = cars_icon_proto[mod_id.toString()];
    }

	  if (cars[devid].active === 0) {
      cars[devid].active = 1;
	    map.removeOverlay(car_park[devid]);
	  }
    if (cars[devid].lon === 0) {
      cars[devid].lon = lon_end;
      cars[devid].lat = lat_end;
    }

//test local convert hack---> OK!!!
    // /*
    var start = Wgs84ToBd09(Number(cars[devid].lon), Number(cars[devid].lat));
    var end = Wgs84ToBd09(Number(lon_end), Number(lat_end));
  	DrawIcon(devid, new BMap.Point(start[0], start[1]), new BMap.Point(end[0], end[1]));
    // */
//test done

     /* Baidu Map Coor Convert API
    var pointArr = [];
    var convertor = new BMap.Convertor();
    pointArr.push(new BMap.Point(cars[devid].lon, cars[devid].lat));
    pointArr.push(new BMap.Point(lon_end, lat_end));
    convertor.translate(pointArr, 1, 5, translateCallback);
    // */

    cars[devid].lon = lon_end;
    cars[devid].lat = lat_end;

  });

   /*
  translateCallback = function (data){
    if(data.status === 0) {
      //alert(data.points[0]);
      //alert(data.points[1]);
      DrawLine("test", data.points[0], data.points[1]);
    }
  }
  // */

  function contains(arr, obj) {   
    for (var key in arr) {
      if (key === obj) {
        return true;
      }   
    }
    return false;  
  }

  function ChangeCity(city) {
    if (city === "beijing") {
      map.panTo(new BMap.Point(116.739, 39.739));
    } else if (city === "shanghai") {
      map.panTo(new BMap.Point(121.479, 31.235));
    }
  }

  function getFileFromServer(url, doneCallback) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("GET", url, true);
    xhr.send();
  
    function handleStateChange() {
      if (xhr.readyState === 4) {
        doneCallback(xhr.status == 200 ? xhr.responseText : null, url);
      }
    }
  }

  function DrawLine(devid, start_point, end_point){
	  var polyline = new BMap.Polyline([
	                                   start_point,
	                                   end_point,
	                                   ], {strokeColor:cars[devid].color, // color
	                                   strokeWeight:3, // width
	                                   strokeOpacity:1}); // opacity
	  map.addOverlay(polyline);
  }
  
  function DrawIcon(devid, start_point, end_point){
	  if (car_mark[devid]) {
	    map.removeOverlay(car_mark[devid]);
	  }
	  car_mark[devid] = new BMap.Marker(
	              end_point,
	             {icon:cars_icon[devid]});
    car_mark[devid].addEventListener("click", function attribute(e) {
      var p = e.target;
      //alert("marker的位置是" + p.getPosition().lng + "," + p.getPosition().lat);
      var s3url = s3url_head + devid + s3url_end;
      window.open(s3url);
    });
	  map.addOverlay(car_mark[devid]);
	  DrawLine(devid, start_point, end_point);
  }

  // convert wgs84 to bd09
  var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
  var PI = 3.1415926535897932384626;
  var a = 6378245.0;
  var ee = 0.00669342162296594323;
  
  function Wgs84ToBd09(lng, lat) { 
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
  
    var z = Math.sqrt(mglng * mglng + mglat * mglat) + 0.00002 * Math.sin(mglat * x_PI);
    var theta = Math.atan2(mglat, mglng) + 0.000003 * Math.cos(mglng * x_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat]
  }
  function transformlat(lng, lat) { 
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
  }
  function transformlng(lng, lat) { 
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
  }
  function distance(latA, lonA, latB, lonB) {  
    var earthR = 6371000.;  
    var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lonA - lonB) * this.PI / 180);  
    var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);  
    var s = x + y;  
    if (s > 1) s = 1;  
    if (s < -1) s = -1;  
    var alpha = Math.acos(s);  
    var distance = alpha * earthR;  
    return distance;  
  }

