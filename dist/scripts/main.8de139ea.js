var WebFontConfig={},commonsModule=function(){"use strict";var a={},b=function(a,b){var d=$(a);d&&(d.find(b.containers).filter(":visible").each(function(a,c){var d=$(c);d.attr("data-adsbygoogle-status")||(d.attr("data-ad-client")||d.attr("data-ad-client",b.adClient),d.attr("data-ad-slot")||d.attr("data-ad-slot",b.adSlot),d.attr("data-ad-format")||d.attr("data-ad-format",b.adFormat),(adsbygoogle=window.adsbygoogle||[]).push({}))}),c(a,b))},c=function(a,c){var d=$(a);d&&d.find(c.tabLinksSelector).filter(":not(.active)").each(function(a,d){$(d).one("shown.bs.tab",function(a){var d=$(a.target).attr("href");b(d,c)})})};a.adsense=function(a){a=$.extend(!0,a,{containers:".adsbygoogle",adClient:"ca-pub-8495719252049968",adSlot:"3723415549",adFormat:"auto",tabLinksSelector:'a[data-toggle="tab"]'}),$(function(){$("body").append('<!-- Google Adsense --><script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>')}),$(window).on("load",function(){b("body",a)})},a.parallax=function(a){a=$.extend(!0,a,{selector:'section[data-type="background"]'}),$(function(){var b=$(window);$(a.selector).each(function(){var a=$(this);b.scroll(function(){var c=-(b.scrollTop()/a.data("speed")),d="50% "+c+"px";a.css({backgroundPosition:d})})})})},a.scrollTo=function(a){a=$.extend(!0,a,{}),$(function(){$(".scroll").click(function(){return $.scrollTo(this.hash,1500,{easing:"swing"}),!1}),$(".scroll-top-bottom").click(function(){return $.scrollTo("#intro",1500,{easing:"swing"}),$.scrollTo("#about",1500,{easing:"swing"}),!1})})},a.storeActiveTab=function(a){a=$.extend(!0,a,{linksSelector:'.navbar a[data-toggle="tab"]',useHash:!localStorage});var b="selectedTabFor"+a.linksSelector;localStorage||(a.useHash=!0),$(function(){function c(b){return a.useHash?location.hash:localStorage.getItem(b)}function d(b,c){a.useHash?location.hash=c:localStorage.setItem(b,c)}var e=$(a.linksSelector);e&&(c(b)&&("undefined"!=typeof $.fn.tab?e.filter('[href="'+c(b)+'"]').tab("show"):console.warn("Bootstrap tab plugin is not loaded")),e.on("click",function(a){d(b,this.getAttribute("href"))}))})};var d=function(){if(document.cookie){var a=document.cookie.split(";");a.forEach(function(a){document.cookie=a.split("=")[0]+"=; username=; expires=Thu, 01 Jan 1970 00:00:00 UTC"})}localStorage&&localStorage.clear()};return a.resetButton=function(a){a=$.extend(!0,a,{buttonSelector:"#reset_all",warning:{title:"Are you sure?",text:"This will reset settings, erase your roadbook and delete local data stored by this application.",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"Yes reset all",cancelButtonText:"No stop !",closeOnConfirm:!1,closeOnCancel:!1},confirmation:{title:"Cancelled",text:"You can continue where you left off.",type:"error",timer:2e3,showConfirmButton:!1}}),$(function(){$(a.buttonSelector).click(function(){swal?swal(a.warning,function(b){b?(d(),location.reload()):swal(a.confirmation)}):(d(),location.reload())})})},a.loadGoogleFonts=function(a){a=$.extend(!0,a,{fontFamilies:["Material+Icons"],webfontVersion:"1.5.18"});var b=$(".material-icons");$.extend(!0,WebFontConfig,{google:{families:a.fontFamilies},active:function(){b.show()}}),function(c){b.hide();var d=c.createElement("script"),e=c.scripts[0];d.src="https://ajax.googleapis.com/ajax/libs/webfont/"+a.webfontVersion+"/webfont.js",e.parentNode.insertBefore(d,e)}(document)},a}(),mapModule=function(){"use strict";var a,b=$.Deferred(),c=function(c){return b.resolve(),a},d=function(a){var b=a.getView(),c=new ol.Geolocation({projection:b.getProjection(),tracking:!0});c.once("change:position",function(){b.setCenter(c.getPosition()),b.setZoom(10)})},e=function(a){var b=ol.extent.createEmpty();a.getLayers().forEach(function(a){ol.extent.extend(b,a.getSource().getExtent())}),a.getView().fit(b,a.getSize())},f=function(a,b){if(0==a)return"0 Byte";var c=1e3,d=b+1||3,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return(a/Math.pow(c,f)).toPrecision(d)+" "+e[f]},g=function(a,b){if(!(window.File&&window.FileReader&&window.FileList&&window.Blob))return void swal({title:"Oups!",text:"The File APIs are not fully supported by your browser.",type:"warning"});var c,d=new ol.format.GPX,e=$(a);e.on("change",function(e){for(var g,h=e.target.files,i=[],j=0;g=h[j];j++){var k=new FileReader;k.readAsText(g),k.onload=function(a){c=d.readFeatures(a.target.result,{dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"}),b.getSource().addFeatures(c),b.setProperties({visible:!0})},k.onloadstart=function(a){},k.onloadend=function(a){console.log("GPX tracks loaded")},k.onerror=function(a){swal({title:"Oups!",text:"An error occured while trying to read your file.",type:"warning"})},i.push('<li class="list-group-item">'+escape(g.name)+' <span class="badge">'+f(g.size)+(" "+g.type||"")+"<span></li>")}var l=$(a+"_list");l&&l.html('<ul class="list-group">'+i.join("")+"</ul>")})};return{map:a,ready:b,init:c,centerOnPosition:d,setFileSource:g,fitAll:e}}(),mapLayersModule=function(){"use strict";function a(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r=a[0],s=r.width,t=r.height,u=r.data,v=new Uint8ClampedArray(u.length),w=2*b.resolution,x=s-1,y=t-1,z=[0,0,0,0],A=2*Math.PI,B=Math.PI/2,C=Math.PI*b.sunEl/180,D=Math.PI*b.sunAz/180,E=Math.cos(C),F=Math.sin(C);for(d=0;y>=d;++d)for(g=0===d?0:d-1,h=d===y?y:d+1,c=0;x>=c;++c)e=0===c?0:c-1,f=c===x?x:c+1,i=4*(d*s+e),z[0]=u[i],z[1]=u[i+1],z[2]=u[i+2],z[3]=u[i+3],j=b.vert*(z[0]+2*z[1]+3*z[2]),i=4*(d*s+f),z[0]=u[i],z[1]=u[i+1],z[2]=u[i+2],z[3]=u[i+3],k=b.vert*(z[0]+2*z[1]+3*z[2]),l=(k-j)/w,i=4*(g*s+c),z[0]=u[i],z[1]=u[i+1],z[2]=u[i+2],z[3]=u[i+3],j=b.vert*(z[0]+2*z[1]+3*z[2]),i=4*(h*s+c),z[0]=u[i],z[1]=u[i+1],z[2]=u[i+2],z[3]=u[i+3],k=b.vert*(z[0]+2*z[1]+3*z[2]),m=(k-j)/w,n=Math.atan(Math.sqrt(l*l+m*m)),o=Math.atan2(m,-l),o=0>o?B-o:o>B?A-o+B:B-o,p=F*Math.cos(n)+E*Math.sin(n)*Math.cos(D-o),i=4*(d*s+c),q=255*p,v[i]=q,v[i+1]=q,v[i+2]=q,v[i+3]=u[i+3];return new ImageData(v,s,t)}var b={},c={bingMapsKey:"Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3",properties:{visible:!1,preload:"Infinity"}},d=function(a){$.extent(c,a)},e=function(a,d){if(!b[a])return void console.warn(a+" layer definition is not defined");var e=b[a]();return e.setProperties(c.properties),d&&e.setProperties(d),e};b.openStreetMap=function(){return new ol.layer.Tile({name:"openStreetMap",title:"Road Map<small> (by OpenStreetMap)</small>",visible:!0,type:"base",source:new ol.source.OSM({urls:["http://a.tile.openstreetmap.org/{z}/{x}/{y}.png"]})})},b.openSeaMap=function(){return new ol.layer.Tile({name:"openSeaMap",title:"Shipping lanes<small> (by OpenSeaMap)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.openseamap.org/">OpenSeaMap</a>'}),ol.source.OSM.ATTRIBUTION],crossOrigin:null,urls:["http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png","http://t1.openseamap.org/seamark/{z}/{x}/{y}.png"]})})},b.openStreetMapHumanitarian=function(){return new ol.layer.Tile({name:"openStreetMapHumanitarian",title:"Humanitarian <small>(by OpenStreetMap)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.openstreetmap.fr/">OpenStreetMap</a>'}),ol.source.OSM.ATTRIBUTION],url:"http://tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png"})})},b.mapquestOSM=function(){return new ol.layer.Tile({name:"mapquestOSM",title:"Road map<small> (by MapQuest)</small>",type:"base",source:new ol.source.MapQuest({layer:"osm"})})},b.mapquestSat=function(){return new ol.layer.Tile({name:"mapquestSat",title:"Aerial view<small> (by MapQuest)</small>",type:"base",source:new ol.source.MapQuest({layer:"sat"})})},b.openCycleMap=function(){return new ol.layer.Tile({name:"openCycleMap",title:"Cycling roads<small> (by OpenCycleMap)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.opencyclemap.org/">OpenCycleMap</a>'}),ol.source.OSM.ATTRIBUTION],url:"http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"})})},b.thunderforestTransport=function(){return new ol.layer.Tile({name:"thunderforestTransport",title:"Transports<small> (by ThunderForest)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.thunderforest.com/">ThunderForest</a>'}),ol.source.OSM.ATTRIBUTION],url:"http://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png"})})},b.thunderforestTransportDark=function(){return new ol.layer.Tile({name:"thunderforestTransportDark",title:"Transport dark<small> (by ThunderForest)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.thunderforest.com/">ThunderForest</a>'}),ol.source.OSM.ATTRIBUTION],url:"https://{a-c}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png"})})},b.thunderforestLandscape=function(){return new ol.layer.Tile({name:"thunderforestLandscape",title:"Landscape<small> (by ThunderForest)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.thunderforest.com/">ThunderForest</a>'}),ol.source.OSM.ATTRIBUTION],url:"https://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png"})})},b.thunderforestOutdoor=function(){return new ol.layer.Tile({name:"thunderforestOutdoor",title:"Outdoor activities<small> (by ThunderForest)</small>",type:"base",source:new ol.source.OSM({attributions:[new ol.Attribution({html:'All maps &copy; <a href="http://www.thunderforest.com/">ThunderForest</a>'}),ol.source.OSM.ATTRIBUTION],url:"https://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"})})},b.arcgis=function(){return new ol.layer.Tile({name:"arcgis",title:"Terrain<small> (by ArcGIS)</small>",type:"base",source:new ol.source.XYZ({crossOrigin:"anonymous",attributions:[new ol.Attribution({html:'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'})],url:"http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"})})},b.arcgisRestHighwayUSA=function(){return new ol.layer.Tile({name:"arcgisRestHighwayUSA",title:"Highway USA<small> (by ArcGIS)</small>",type:"base",extent:[-13884991,2870341,-7455066,6338219],source:new ol.source.TileArcGISRest({url:"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer"})})},b.googleTerrain=function(){return new ol.layer.Tile({name:"googleTerrain",title:"Terrain + labels<small> (by Google)</small>",type:"base",source:new ol.source.XYZ({crossOrigin:"anonymous",url:"http://mts0.google.com/vt/lyrs=t@132,r@285000000&hl=en&src=app&x={x}&y={y}&z={z}&s=1"})})},b.googleSatellite=function(){return new ol.layer.Tile({name:"googleSatellite",title:"Aerial view<small> (by Google)</small>",type:"base",source:new ol.source.XYZ({crossOrigin:"anonymous",url:"http://khms0.google.com/kh/v=165&src=app&x={x}&y={y}&z={z}&s=1"})})},b.bingRoad=function(){return new ol.layer.Tile({name:"bingRoad",title:"Road map<small> (by Bing)</small>",type:"base",maxZoom:19,source:new ol.source.BingMaps({key:c.bingMapsKey,imagerySet:"Road"})})},b.bingAerial=function(){return new ol.layer.Tile({name:"bingAerial",title:"Aerial view<small> (by Bing)</small>",type:"base",maxZoom:19,source:new ol.source.BingMaps({key:c.bingMapsKey,imagerySet:"Aerial"})})},b.bingAerialWithLabels=function(){return new ol.layer.Tile({name:"bingAerialWithLabels",title:"Aerial view with labels<small> (by Bing)</small>",type:"base",maxZoom:19,source:new ol.source.BingMaps({key:c.bingMapsKey,imagerySet:"AerialWithLabels"})})},b.bingCollinsBart=function(){return new ol.layer.Tile({name:"bingCollinsBart",title:"CollinsBart<small> (by Bing)</small>",type:"base",maxZoom:19,source:new ol.source.BingMaps({key:c.bingMapsKey,imagerySet:"collinsBart"})})},b.bingOrdnanceSurvey=function(){return new ol.layer.Tile({name:"bingOrdnanceSurvey",title:"OrdnanceSurvey<small> (by Bing)</small>",type:"base",maxZoom:19,source:new ol.source.BingMaps({key:c.bingMapsKey,imagerySet:"ordnanceSurvey"})})},b.stamenToner=function(){return new ol.layer.Tile({name:"stamenToner",title:"B&W map<small> (by Stamen)</small>",type:"base",source:new ol.source.Stamen({layer:"toner"})})},b.stamenTonerLite=function(){return new ol.layer.Tile({name:"stamenTonerLite",title:"Gray scale map<small> (by Stamen)</small>",type:"base",source:new ol.source.Stamen({layer:"toner-lite"})})},b.stamenTonerBackground=function(){return new ol.layer.Tile({name:"stamenTonerBackground",title:"B&W background<small> (by Stamen)</small>",type:"base",source:new ol.source.Stamen({layer:"toner-background"})})},b.stamenWatercolor=function(){return new ol.layer.Tile({name:"stamenWatercolor",title:"Watercolor map<small> (by Stamen)</small>",type:"base",source:new ol.source.Stamen({layer:"watercolor"})})},b.stamenTerrain=function(){return new ol.layer.Tile({name:"stamenTerrain",title:"Terrain USA<small> (by Stamen)</small>",type:"base",source:new ol.source.Stamen({layer:"terrain"})})},b.stamenTerrainWithLabels=function(){return new ol.layer.Tile({name:"stamenTerrainLabels",title:"Terrain + labels USA<small> (by Stamen)</small>",type:"base",source:new ol.source.Stamen({layer:"terrain-labels"})})},b.googleBike=function(){return new ol.layer.Tile({name:"googleBike",title:"Cycling roads<small> (by Google)</small>",visible:!0,opacity:1,source:new ol.source.XYZ({crossOrigin:"anonymous",url:"http://mts0.google.com/vt/lyrs=h@239000000,bike&hl=en&src=app&x={x}&y={y}&z={z}&s=1"})})},b.mapquestHyb=function(){return new ol.layer.Tile({name:"mapquestHyb",title:"City names<small> (by MapQuest)</small>",source:new ol.source.MapQuest({layer:"hyb"})})},b.lonviaCycling=function(){return new ol.layer.Tile({name:"lonviaCycling",title:"Cycling roads<small> (by Lonvia)</small>",opacity:.7,source:new ol.source.OSM({attributions:[new ol.Attribution({html:'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}),ol.source.OSM.ATTRIBUTION],crossOrigin:null,url:"http://tile.lonvia.de/cycling/{z}/{x}/{y}.png"})})},b.lonviaHiking=function(){return new ol.layer.Tile({name:"lonviaHiking",title:"Hiking paths<small> (by Lonvia)</small>",opacity:.7,source:new ol.source.OSM({attributions:[new ol.Attribution({html:'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}),ol.source.OSM.ATTRIBUTION],crossOrigin:null,url:"http://tile.lonvia.de/hiking/{z}/{x}/{y}.png"})})},b.stamenTonerHybrid=function(){return new ol.layer.Tile({name:"stamenTonerHybrid",title:"B&W roads + labels<small> (by Stamen)</small>",source:new ol.source.Stamen({layer:"toner-hybrid"})})},b.stamenTonerLabels=function(){return new ol.layer.Tile({name:"stamenTonerLabels",title:"B&W labels<small> (by Stamen)</small>",source:new ol.source.Stamen({layer:"toner-labels"})})},b.stamenTonerLines=function(){return new ol.layer.Tile({name:"stamenTonerLines",title:"B&W roads<small> (by Stamen)</small>",source:new ol.source.Stamen({layer:"toner-lines"})})},b.mapboxShadedRelief=function(){return new ol.layer.Image({name:"mapboxShadedRelief",title:"Shaded relief<small> (by Mapbox)</small>",source:new ol.source.Raster({sources:[new ol.source.XYZ({url:"https://{a-d}.tiles.mapbox.com/v3/aj.sf-dem/{z}/{x}/{y}.png",crossOrigin:"anonymous"})],operationType:"image",operation:a}),opacity:.3})},b.timeZones=function(){return new ol.layer.Vector({name:"timeZones",title:"Time zones",style:f,minResolution:4891,source:new ol.source.Vector({extractStyles:!1,projection:"EPSG:3857",url:"data/kml/timezones.kml",format:new ol.format.KML})})},b.drawingVector=function(){return new ol.layer.Tile({name:"drawing",title:"My drawings"})};var f=function(a){var b=0,c=a.get("name"),d=c.match(/([\-+]\d{2}):(\d{2})$/);if(d){var e=parseInt(d[1],10),f=parseInt(d[2],10);b=60*e+f}var g=new Date,h=new Date(g.getTime()+6e4*(g.getTimezoneOffset()+b)),i=Math.abs(12-h.getHours()+h.getMinutes()/60);i>12&&(i=24-i);var j=.75*(1-i/12);return[new ol.style.Style({fill:new ol.style.Fill({color:[85,85,85,j]}),stroke:new ol.style.Stroke({color:"#ffffff"})})]};return{create:e,config:d}}(),mapControlsModule=function(){"use strict";var a={},b={},c=function(a){$.extent(b,a||{})},d=function(b,c){if(!a[b])return void console.warn(b+" control definition is not defined");var d=a[b]();return d};return a.attribution=function(){return new ol.control.Attribution({collapsible:!0})},a.zoomToExtent=function(){return new ol.control.ZoomToExtent({})},a.scaleLine=function(){return new ol.control.ScaleLine({})},a.fullScreen=function(){return new ol.control.FullScreen({})},a.overviewMap=function(){return new ol.control.OverviewMap({className:"ol-overviewmap ol-custom-overviewmap",collapseLabel:"«",label:"»",collapsed:!0})},a.layerSwitcher=function(){return new ol.control.LayerSwitcher({})},a.mousePosition=function(){return new ol.control.MousePosition({coordinateFormat:ol.coordinate.createStringXY(4),projection:"EPSG:4326",className:"custom-mouse-position",target:document.getElementById("mouse-position"),undefinedHTML:"&nbsp;"})},{create:d,config:c}}(),mapInputsModule=function(){"use strict";var a,b={},c=function(a,c,d){if(!b[a])return void console.warn(a+" input definition does not exists");var e=b[a](c);return e};return b.layer=function(b){var c=$(b);c&&(a.getLayers().forEach(function(a){a.get("visible")&&c.val(a.get("name"))}),c.on("change",function(){var b=c.find(":selected").val();a.getLayers().forEach(function(a){a.set("visible",a.get("name")===b)})}))},b.zoom=function(b){var c=$(b);c&&(c.val(this.getZoom()),c.on("change",function(){var b=c.val();(b||0===b)&&a.getView().setZoom(b)}),a.getView().on("change:resolution",function(){c.val(this.getZoom())}))},b.resolution=function(b){var c=$(b);c&&(c.val(this.getResolution()),c.on("change",function(){var b=c.val();(b||0===b)&&a.getView().setResolution(b)}),a.getView().on("change:resolution",function(){c.val(this.getResolution())}))},b.rotation=function(b){var c=$(b);c.on("change",function(){var b=c.val();(b||0===b)&&a.getView().setRotation(b)}),a.getView().on("change:rotation",function(){c.val(this.getRotation())})},b.centerX=function(b){var c=$(Xselector);c.on("change",function(){c.val()}),a.getView().on("change:center",function(){var a=this.getCenter();c.val(a[0])})},b.centerY=function(b){var c=$(b);c.on("change",function(){c.val()}),a.getView().on("change:center",function(){var a=this.getCenter();c.val(a[1])})},b.center=function(b,c){var d=$(b),e=$(c);a.getView().on("change:center",function(){var a=this.getCenter();a&&(d.val(a[0].toFixed(2)),e.val(a[1].toFixed(2)))}),$(b+", "+c).on("change",function(){!d.val()&&0!==d.val()||!e.val()&&0!==e.val()||a.getView().setCenter(d.val(),e.val())})},b.exportPNG=function(b){var c=document.getElementById("export-png");c&&c.on("click",function(){a.once("postcompose",function(a){var b=a.context.canvas;c.attr("href",b.toDataURL("image/png"))})})},b.GPXSource=function(a,b){window.File&&window.FileReader&&window.FileList&&window.Blob||console.warn("The File APIs are not fully supported in this browser.");var c=$(a);c.on("change",function(a){var c=a.target.files;c.forEach(function(a){var c=new FileReader;c.onload=function(a){return function(c){b.setProperties({title:escape(a.name),source:new ol.source.Vector({url:c.target.result,format:new ol.format.GPX}),visible:!0})}}(a),c.readAsDataURL(a)})})},{create:c}}(),mapDrawModule=function(){"use strict";var a,b=new ol.Collection,c=function(a){f.setMap(a),a.addInteraction(g)},d=function(c,d){c&&(a=new ol.interaction.Draw({features:b,type:c}),d.addInteraction(a))},e=function(b,c){var e=document.getElementById(b);e.onchange=function(){c.removeInteraction(a),d(e.value,c)},d(e.value,c)},f=new ol.layer.Vector({source:new ol.source.Vector({features:b}),style:new ol.style.Style({fill:new ol.style.Fill({color:"rgba(255, 255, 255, 0.2)"}),stroke:new ol.style.Stroke({color:"#ffcc33",width:2}),image:new ol.style.Circle({radius:7,fill:new ol.style.Fill({color:"#ffcc33"})})})}),g=new ol.interaction.Modify({features:b,deleteCondition:function(a){return ol.events.condition.shiftKeyOnly(a)&&ol.events.condition.singleClick(a)}});return{init:c,drawInteraction:d,addDrawTypeSwitcher:e}}(),addthis_share={url:"http://www.tinyroadbook.tk",title:"I'm doing a tiny road book for my next tour"},cityPickerModule=function(){"use strict";var a,b={quill:{styles:!1,formats:["bold","italic","strike","underline","font","size","align","color","background"]},spinner:{color:"#fff",scale:.75}},c=new Spinner(b.spinner),d=function(a,b,c,d,e){e=e||Math.ceil(d.length/2),a=Math.min(Math.max(a,b),c);var f=(c-b)/d.length,g=(a-b)/f;g=g.toFixed(0);var h=d[g]||d[e];return console.log("numberToFontSize("+a+", "+b+", "+c+") step:"+f+" i:"+g+" name:"+h),h},e=function(a,b,c){var e=["xx-small","x-small","smaller","small","normal","large","larger","x-large","xx-large"];return d(a,b,c,e,4)},f=function(a,b,c){var e=["lightgray","gray","black"];return d(a,b,c,e,1)},g=function(){var b,c=a.getLength();c>1&&a.focus();var d=a.getSelection();return d?(b=d.start,d.start!==d.end&&a.deleteText(d.start,d.end),console.log("Cursor ready for insertion at pos "+b)):(b=c-1,console.log("Cursor is ready for insertion at the last pos "+b)),b},h=function(b){var c,d,h=[],i=["country","state","county","city","town","village","hamlet"];if(b){if(b.address){var j;i.forEach(function(a){b.address[a]&&(j=b.address[a])}),h.push(j)}if(b.extratags&&(b.extratags.population&&$("#font_size_proportional").is(":checked")&&(c=e(Math.log(b.extratags.population)||0,0,Math.log(25e6))),b.extratags.population&&$("#font_color_proportional").is(":checked")&&(d=f(Math.log(b.extratags.population)||0,0,Math.log(25e6)))),b.namedetails&&$("#insert_local_name").is(":checked")&&b.namedetails.name&&h.push(b.namedetails.name),h.length>0){var k,l=g();b.icon&&$("#insert_icon")&&$("#insert_icon").is(":checked")&&(k=b.icon,console.log("pos:"+l+" text:"+k),a.insertEmbed(l,"image",k),l+=1),k=$.unique(h).join(" / "),a.insertText(l,k,{size:c||"1em",color:d||"black"}),l+=k.length;var m=$("#separator");k=m?m.val():"\n",a.insertText(l,k),l+=k.length,a.setSelection(l,l),console.log("Cursor positioned at pos:"+l+"/"+a.getLength()-1)}else console.log("Extracted data does not contain a city name.")}},i=function(a){if(a&&a.address){var b={format:"json",limit:1,polygon_svg:0,addressdetails:1,extratags:1,namedetails:1},c=[];return["village","town","city","county","state","country"].forEach(function(b){return a.address[b]?(c.push(a.address[b]),!1):void 0}),$.each({city:"city",county:"county",state:"state",country:"country",postal_code:"postalcode",country_code:"countrycodes"},function(c,d){a.address[c]&&(b[d]=a.address[c])}),geocodeModule.nominatimSearch(b,c)}},j=function(a,b){if(!a||!b)return!1;c.spin(document.getElementById("spinner")),b=Math.min(Math.max(b||10,0),18);var d={format:"json",lon:a[0],lat:a[1],zoom:b,osm_type:"N",addressdetails:1,extratags:0,namedetails:0,"accept-language":"en"};geocodeModule.nominatimReverse(d).success(function(a){setTimeout(function(){return i(a).success(function(a){console.log(JSON.stringify(a)),h(a[0])}).done(function(){c.stop()})},1e3)})},k=function(a){console.log(a),console.log($("#export_direction").val());var b=$("#export_direction");b&&"inline"===b.val()&&(a=a.replace(/<div>/g,", "),console.log(a));var c=window.open("",window.location.hostname,"");return c.document.write("<html><head><title>"+window.location.hostname+"</title></head><body>"+a+"</body></html>"),c.print(),c.close(),!0},l=function(a){a.on("click",function(b){var c=a.getView(),d=c.getZoom(),e=b.coordinate,f=c.getProjection();e=ol.proj.transform(e,f.getCode(),"EPSG:4326"),console.time("Reverse geocoding"),j(e,d),console.timeEnd("Reverse geocoding")})},m=function(){var b=$("#copy_editor, #print_editor, #erase_editor");1===a.getLength()?b.attr("disabled",!0).closest("li").addClass("disabled"):b.attr("disabled",!1).closest("li").removeClass("disabled")};return $(function(){var c=$("#editor");a=new Quill("#editor",b.quill),a.addModule("toolbar",{container:"#editor_toolbar"});a.addModule("multi-cursor",{timeout:1e4});a.on("selection-change",function(a){var b=$("#editor_toolbar").find(".ql-bold, .ql-italic, .ql-strike, .ql-underline, .ql-size, .ql-color, .ql-background");a?a.start===a.end?(b.attr("disabled",!0).closest("li").addClass("disabled"),console.log("Cursor is on",a.start)):b.attr("disabled",!1).closest("li").removeClass("disabled"):console.log("Cursor not in the editor")}),a.on("text-change",function(b,d){$("#stored_roadbook").val(a.getHTML()).trigger("change"),m(),c.scrollTop(c[0].scrollHeight),$.extend(addthis_share,{description:a.getHTML()})}),$("#stored_roadbook").garlic({excluded:"",onRetrieve:function(b,c){a.setHTML(c)}}),m(),$("#print_editor").click(function(b){b.preventDefault(),k(a.getHTML())}),$("#erase_editor").click(function(b){b.preventDefault(),swal({title:"Are you sure?",text:"Your roadbook will be permanently deleted. You will not be able to recover it.",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"Yes delete it",cancelButtonText:"No stop !",closeOnConfirm:!1,closeOnCancel:!1},function(b){b?(a.setText(""),swal({title:"Deleted!",text:"Your roadbook has been deleted. Let's start a new one!",type:"success",timer:2500,showConfirmButton:!1})):swal({title:"Cancelled",text:"Whew... you narrow escape! ^_^",type:"error",timer:2500,showConfirmButton:!1})})})}),{setMap:l}}(),geocodeModule=function(){"use strict";var a=function(a,b){var c="http://nominatim.openstreetmap.org/search/"+encodeURI(b)+"?"+$.param(a);return console.log(c),$.ajax({url:c,error:function(a,b,c){console.warn(b)}})},b=function(a){var b="http://nominatim.openstreetmap.org/reverse?"+$.param(a);return console.log(b),$.ajax({url:b,error:function(a,b,c){console.warn(b)}})};return{nominatimSearch:a,nominatimReverse:b}}();console.time("$: HTML loaded (except images) and DOM is ready"),console.time("$(document).ready: HTML loaded (except images) and DOM is ready"),console.time("$(window).load: Page is fully loaded, including frames, objects and images");var appModule=function(){"use strict";var a,b=mapLayersModule.create("mapquestSat"),c=mapLayersModule.create("openCycleMap"),d=mapLayersModule.create("openStreetMap",{visible:!0}),e=mapLayersModule.create("openStreetMapHumanitarian"),f=mapLayersModule.create("thunderforestTransport"),g=mapLayersModule.create("thunderforestOutdoor"),h=mapLayersModule.create("mapquestHyb"),i=mapLayersModule.create("lonviaHiking"),j=mapLayersModule.create("lonviaCycling"),k=new ol.layer.Vector({name:"gpsTrack",title:"GPX tracks",visible:!1,source:new ol.source.Vector({}),style:new ol.style.Style({stroke:new ol.style.Stroke({color:"rgba(51, 122, 183, 0.7)",width:3})})}),l=mapControlsModule.create("attribution"),m=mapControlsModule.create("scaleLine"),n=mapControlsModule.create("fullScreen"),o=mapControlsModule.create("layerSwitcher"),p=function(a){var p=[new ol.layer.Group({name:"baseLayers",title:"Base map",layers:[b,e,f,g,c,d]}),new ol.layer.Group({name:"overlays",title:"Overlays",layers:[k,h,i,j]})],q=ol.control.defaults({attribution:!1,attributionOptions:{collapsible:!1},zoomOptions:{}}).extend([l,m,n,o]);return new ol.Map({layers:p,target:a,view:new ol.View({center:[0,0],zoom:4}),controls:q})};return $(function(){$('a[data-toggle="tab"]').one("shown.bs.tab",function(b){var c=$(b.target).attr("href");"#picker"===c&&(a=p("map"),mapModule.centerOnPosition(a),cityPickerModule.setMap(a),$("#gpx_file_path").on("change",function(){o.renderPanel()}))}),window.File&&window.FileReader&&window.FileList&&window.Blob?mapModule.setFileSource("#gpx_file_path",k):$("#gpx_file_path").closest(".form-group").hide(),$(".start-editing").click(function(){$('a[href="#picker"]').tab("show")}),$('input[type="hidden"]').trigger("change"),$("#reset_settings").click(function(){$("#settings form").garlic("destroy"),location.reload()}),commonsModule.parallax(),commonsModule.adsense(),commonsModule.storeActiveTab(),commonsModule.resetButton(),commonsModule.loadGoogleFonts()}),{map:a}}();