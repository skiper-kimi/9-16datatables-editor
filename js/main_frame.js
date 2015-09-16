/**
 * Created by Administrator on 2015/9/9.
 */

$(document).ready(function() {
    var table;
    var editor;
    var map;
    var load_state;
    var json_data;
    var com_addr = [];
    var com_nam = [];
    var resultData = [];
    var resData = {};
    var myGeo = new BMap.Geocoder();
    initMap();

    function excute(string){

    }

    json_data = $.ajax({
        //timeout : 2000, //超时时间设置，单位毫秒
        url:'http://192.168.1.222:5000/api/v1/auth/map?view=all&page=1',
        type:'GET',
        dataType:'JSON',
        success: function(data) {
            resData.data = data.data.posts;
            var dataLength = getJsonLength(data.data.posts);
            for(var i=0;i<dataLength;i++) {
                com_addr.push(data.data.posts[i].address);
                com_nam.push(data.data.posts[i].company_name);
            }
            load_state = 1;
            initView(load_state);
            createTable();
            bdGEO();
        },
        error:function(){
            load_state = 0;
            initView(load_state);
        }
    });

    function initView(that){
        if(that){
            $(".selectIcon").attr("id","selectTab");
            $(".mapIcon").attr("id","mapTab");
            $(".tableIcon").attr("id","tableTab");
            $("#loading").css("display","none");
            $("#container").toggle(300);
        }
        else{
            $("#loading").css("display","none");
            $("#loadFail").css("display","block");
            $(".mapIcon").attr("id","mapTab");
        }

        //页面显示
        $("#selectTab").click(function(){
            $("#selectTags").toggle(300);
        });
        $("#mapTab").click(function(){
            if(load_state == 1) {
                if ($("#container").css("display") == "block") {
                    $("#container").toggle(300);
                }
                $("#mapContainer").toggle(300);
            }
            else{
                $("#loadFail").toggle(300);
                $("#mapContainer").toggle(300);
            }
        });
        $("#tableTab").click(function(){
            if($("#mapContainer").css("display")=="block"){
                $("#mapContainer").toggle(300);
            }
            $("#container").toggle(300);
        });
    }

    //表格功能
    function createTable(){

        //表格初始化
        editor = new $.fn.dataTable.Editor({
            ajax: "../a.html",
            table: "#example",
            fields: [
                {label: "ID：", name: "id"},
                {label: "公司名称：", name: "company_name"},
                {label: "联系人：", name: "contact_name"},
                {label: "电话：", name: "phone"},
                {label: "状态：", name: "is_contact"},
                {label: "地址：", name: "address"},
                {label: "网址：", name: "website"},
                {label: "地图：", name:"map"},
                {label: "描述：", name: "description"},
                {label: "添加时间：", name: "time"}
            ],
            i18n: {
                create: {
                    button: "新增",
                    title:  "填写新供应商信息",
                    submit: "创建"
                },
                edit: {
                    button: "编辑",
                    title:  "编辑供应商信息",
                    submit: "更新"
                },
                remove: {
                    button: "删除",
                    title:  "删除供应商信息",
                    submit: "确认",
                    confirm: {
                        _: "您是否确认删除选中的 %d 条记录?",
                        1: "您是否确认删除选中的此条记录?"
                    }
                },
                error: {
                    system: "系统发生错误..."
                }
            }
        });
        table = $('#example').DataTable({
            "columnDefs": [
                {
                    "targets": [1],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [8],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [8],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [10],
                    "visible": false,
                    "searchable": false
                }
            ],
            "dom":  'Bfrtip',
            "ajax":{
                url:'http://192.168.1.222:5000/api/v1/auth/map?view=all&page=1',
                dataSrc:'data.posts',
            },
            "columns": [
                {
                    data: null,
                    defaultContent: '',
                    className: 'select-checkbox',
                    orderable: false
                },
                {"data": 'id' },
                {"data": 'company_name'},
                {"data": 'contact_name'},
                {"data": 'phone'},
                {"data": 'is_contact'},
                {"data": 'address'},
                {"data": 'website'},
                {"data": 'map'},
                {"data": 'description'},
                {"data": 'timestamp'},
            ],
            "buttons": [
                 { extend: "create", editor: editor },
                 { extend: "edit",   editor: editor },
                 { extend: "remove", editor: editor },
            ],
            "select":  {
                style:    'os',
                selector: 'td:first-child'
            },
            "bLengthChange": false,
            "bAutoWidth": true,
            "processing": true,
            "deferRender": true,
            "oLanguage": {
                "sProcessing": "正在加载中......",
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "对不起，查询不到相关数据！",
                "sEmptyTable": "表中无数据存在！",
                "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
                "sInfoFiltered": "数据表中共为 _MAX_ 条记录",
                "sSearch": "搜索:",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": "末页"
                }
            }
        });
/*        table.buttons().container()
            .appendTo( $('.col-sm-6:eq(0)', table.table().container() ) );*/

        //点击事件绑定
        $("#example tbody").on("click","tr",function () {
            //选中后高亮显示
            var temp = $("#example").dataTable().api();
           /* if ( $(this).hasClass('selected') ) {
                $(this).removeClass('selected');
            }
            else {
                table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }*/
            var data = temp.row(this).data();
            myGeo.getPoint(data.address, function (point) {
                if (point) {
                    map.centerAndZoom(point,19);
                }
            }, "厦门市");
/*             editor.inline( this, {onBlur: 'submit'});*/
        });
        $('#example').on( 'click', 'tbody td:not(:first-child)', function (e) {
            editor.inline( this );
        } );

    }

    function getJsonLength(jsonData){
        var jsonLength = 0;
        for(var item in jsonData){
            jsonLength++;
        }
        return jsonLength;
    }
    //地图功能
    function initMap(){
        createMap();//创建地图
        setMapEvent();//设置地图事件
        addMapControl();//向地图添加控件
        addMapOverlay();//向地图添加覆盖物
    }
    function createMap(){
        map = new BMap.Map("mapContainer");
        map.centerAndZoom(new BMap.Point(117.98,24.58),13);
    }
    function setMapEvent(){
        map.enableScrollWheelZoom();
        map.enableKeyboard();
        map.enableDragging();
        map.enableDoubleClickZoom()
    }
    function addClickHandler(target,window){
        target.addEventListener("click",function(){
            target.openInfoWindow(window);
        });
    }
    function addMapOverlay(){
    }
    //向地图添加控件
    function addMapControl(){
        var scaleControl = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
        scaleControl.setUnit(BMAP_UNIT_IMPERIAL);
        map.addControl(scaleControl);
        var navControl = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
        map.addControl(navControl);
        var overviewControl = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:false});
        map.addControl(overviewControl);
    }
    //地图上添加供应商标注
    function bdGEO(){
        var add = com_addr;
        var nam = com_nam;
        for(var i=0; i<com_addr.length; i++){
            geocodeSearch(add[i],nam[i]);
        }
    }
    function geocodeSearch(add,nam) {
        setTimeout(window.bdGEO, 400);
        myGeo.getPoint(add, function (point) {
            if (point) {
                var address = new BMap.Point(point.lng, point.lat);
                var myLabel = new BMap.Label(nam, {offset: new BMap.Size(20, -10)});
                myLabel.setTitle(add);
                myLabel.setStyle({
                    "color":"silver",
                    "fontSize":"12px",
                    "border":"1px",
                    "height":"19px",
                    "width":"100px",
                    "textAlign":"center",
                    "cursor":"pointer"
                });
                addMarker(address, myLabel);
            }
        }, "厦门市");
        // 编写自定义函数,创建标注
        function addMarker(point, label) {
            var marker = new BMap.Marker(point);
            map.addOverlay(marker);
            marker.setLabel(label);
        };
    }
    // 百度地图API功能
    function G(id) {
        return document.getElementById(id);
    }
    //建立一个自动完成的对象
    var ac = new BMap.Autocomplete({"input" : "suggestId", "location" : map});
    ac.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
            value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
            _value = e.toitem.value;
            value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
    });
    var myValue;
    ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
        var _value = e.item.value;
        myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

        setPlace();
    });
    function setPlace(){
        map.clearOverlays();    //清除地图上所有覆盖物
        bdGEO();
        function myFun(){
            var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果

            var icon = new BMap.Icon('bg/pin.png', new BMap.Size(20, 32), {
                anchor: new BMap.Size(10, 30),
                infoWindowAnchor: new BMap.Size(10, 0)
            });
            varmkr =new BMap.Marker(pp,{
                icon: icon,
                enableDragging: true,
                raiseOnDrag: true
            });
            map.addOverlay(varmkr);    //添加标注
            map.centerAndZoom(varmkr,5);
            varmkr.addEventListener("click", function(e){
                this.openInfoWindow(new BMap.InfoWindow("位于: "+e.point.lng+","+e.point.lat));
            });
            varmkr.addEventListener('dragend', function(e){

            });
            varmkr.addEventListener("mouseover", function(e){
                this.setTitle("位于: "+e.point.lng+","+e.point.lat);
            });
        }
        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(myValue);
    }


    //搜索框搜索数据库信息
    $(function(){
    });


});

