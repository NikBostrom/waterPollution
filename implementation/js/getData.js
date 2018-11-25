$(document).ready(function(){
    // $("button").click(function(){
    $.getJSON("https://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&stateCd=ca&parameterCd=00065,00300,99133,72240,30208,63680&siteStatus=all", function(result){
        // COMMD OUT
        // console.log(result);
        // $.each(result, function(i, field){
        //     $("div").append(field + " ");
        // });
        var jsonData = JSON.stringify(result);
        // download(jsonData, 'waterdata.json', 'json');
        // COMMD OUT - Nik
        // console.log("done");
    });
    // });
});

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
// download(jsonData, 'json.txt', 'text/plain');