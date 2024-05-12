/**************************************************************************************/
/**                          OneClickEdgeBlur.jsx                                    **/
/**                          version 0.1 alpha                                       **/
/**                          作者：千石まよひ                                           **/
/**                          最后更新：20220614                                        **/
/**                 Copyright (c) 2022 Sengoku_Mayoi All rights reserved.            **/
/**************************************************************************************/
var panelGlobal = this;
 var palette = (function () {
 
     // UI 构建
     // =======
     var palette = (panelGlobal instanceof Panel) ? panelGlobal : new Window("palette");
     if (!(panelGlobal instanceof Panel)) palette.text = "Blur it！";
     palette.orientation = "column";
     palette.alignChildren = ["center", "top"];
     palette.spacing = 10;
     palette.margins = 16;
 
    var pluginName = palette.add('edittext {properties: {name: "edittext2"}}'); 
    pluginName.text = "FL Depth Of Field"; 
    pluginName.preferredSize.width = 120; 
     var useFl = palette.add("checkbox", undefined, undefined, {name: "checkbox1"}); 
     useFl.text = "Use Custom Plugin"; 
  
     var create = palette.add("button", undefined, undefined, { name: "create" });
     create.helpTip = "Blur it！";
     create.text = "One Click Edge Blur";
     create.preferredSize.width = 120; // 按钮长度
     create.onClick = create_it  // 绑定函数
 
     // 主函数功能区
     function create_it() {
        var myComp = app.project.activeItem;
        var myLayers = app.project.activeItem.layers;
        var compWith = myComp.width;
        var compHeight = myComp.height;
        var activeCompName = myComp.name;
        var lang = app.isoLanguage;
 
        var ratio = .5523;
        var h = compWith/2;
        var v = compHeight/2;
        var th = h*ratio;
        var tv = v*ratio;

        var blendWI;
        var blMp;
        var sliderC;
        var slider;
        var BlurRad;
    //表达式中英日适配
    /*
    switch(lang){
        case "en_US" : 
            lendWI="Blend With Original";
            blMp="Blur Map";
            sliderC="Slider Control";
            slider="Slider";
            BlurRad="Blur Radius"
            break;
        case "zh_CN" :
            blendWI="与原始图像混合";
            sliderC="滑块控制";
            slider="滑块";
            blMp="模糊图";
            BlurRad="模糊半径"
            break;
        case "ja_JP" :
            blendWI="元の画像とブレンド";
            sliderC="スライダーコントロール";
            slider="スライダー";
            BlurRad="ブラーの半径";
            blMp="ブラーマップ";
            break;
        default :
            alert("Current Language is not supported.");
    }
        */
        if(lang === "en_US"){
            blendWI="Blend With Original";
            blMp="Blur Map";
            sliderC="Slider Control";
            slider="Slider";
            BlurRad="Blur Radius"
        }
        else if(lang === "zh_CN"){
            blendWI="与原始图像混合";
            sliderC="滑块控制";
            slider="滑块";
            blMp="模糊图";
            BlurRad="模糊半径"
        }else{
            blendWI="元の画像とブレンド";
            sliderC="スライダーコントロール";
            slider="スライダー";
            BlurRad="ブラーの半径";
            blMp="ブラーマップ";
        }
        
        //创建深度图
         myLayers.addSolid([0.0,0.0,0.0],'Black',compWith,compHeight,1);
         myLayers.addSolid([1.0,1.0,1.0],'White',compWith,compHeight,1);
         myLayers.addSolid([0.0,0.0,1.0],'Inv',compWith,compHeight,1);
         myComp.layer('Inv').moveToBeginning();
         myComp.layer('Inv').adjustmentLayer = true;
         myComp.layer('Inv').property("Effects").addProperty("ADBE Invert");
    
         
        //创建蒙版
         var selLayer1 = myComp.layer('White');
        
         newMask = selLayer1.Masks.addProperty("Mask");
         newMask.color = [0.5,0.5,0.5];
         newMask.inverted = false;
         newMask.locked = false;
         newMask.name = "Mask 1";
         newMask.maskFeather.setValue([200,200]);
         myProperty = newMask.property("ADBE Mask Shape");
         myShape = myProperty.value;
         //设置蒙版形状
         myShape.vertices = [[h,200],[200,v],[h,2*v-200],[2*h-200,v]];
         myShape.inTangents = [[th,0],[0,-tv],[-th,0],[0,tv]];
         myShape.outTangents = [[-th,0],[0,tv],[th,0],[0,-tv]];
         myShape.closed = true;
         myProperty.setValue(myShape);

        
        //创建控制图层和模糊调整图层
        myLayers.addSolid([1.0,0.0,0.0],'EdgeBlur',compWith,compHeight,1);
        myLayers.addSolid([0.1,0.7,0.7],'Control',compWith,compHeight,1);

        myComp.layer('EdgeBlur').adjustmentLayer = true;//设置调整图层
        myComp.layer('Control').adjustmentLayer = true;
       
        myComp.layer('Control').property("Effects").addProperty("ADBE Slider Control");//创建滑块控制
        
        myComp.layer('Control').property("Effects").addProperty("ADBE Slider Control");
        myComp.layer('Control').effect(sliderC+" 2").name = "Mask Feather"
        myComp.layer('Control').effect("ADBE Slider Control").name = "Blur Radius"
        //创建控制图层
        var crtlLy = myComp.layer('Control');
        ctrlMask = crtlLy.Masks.addProperty("Mask");
        ctrlMask.color = [0.5,1.0,0.5];
        ctrlMask.inverted = false;
        ctrlMask.locked = false;
        ctrlMask.name = "Control Mask";
        ctrlMask.maskFeather.setValue([200,200]);
        ctrlProperty = ctrlMask.property("ADBE Mask Shape");
        ctrlShape = ctrlProperty.value;
        ctrlShape.vertices = [[h,200],[200,v],[h,2*v-200],[2*h-200,v]];
        ctrlShape.inTangents = [[th,0],[0,-tv],[-th,0],[0,tv]];
        ctrlShape.outTangents = [[-th,0],[0,tv],[th,0],[0,-tv]];
        ctrlShape.closed = true;
        ctrlProperty.setValue(ctrlShape);
       //是否使用外置插件
        if(useFl.value){
            myComp.layer('EdgeBlur').property("Effects").addProperty(pluginName.text);
            if(pluginName.text==="FL Depth Of Field"){
                //对于FL Depth Of Field 支持滑块控制模糊半径和蒙版羽化
                myComp.layer('Inv').effect("ADBE Invert")(blendWI).setValue(0);
                myComp.layer('EdgeBlur').effect("FL Depth Of Field")("radius").expression = 'thisComp.layer("Control").effect("Blur Radius")("' + slider + '")';
                myComp.layer('Control').effect("Blur Radius")(slider).setValue(10);
            }
            //对于其他外置插件支持滑块控制蒙版羽化
            myComp.layer('Inv').effect("ADBE Invert")(blendWI).setValue(0);
            myComp.layer('Control').mask(1).maskFeather.expression = 'temp = effect("Mask Feather")("' + slider + '");[temp, temp]';
            myComp.layer('Control').effect("Mask Feather")(slider).setValue(200);
            myComp.layer('Inv').effect("ADBE Invert")(blendWI).setValue(100);
        }else{
            //对于摄像机镜头模糊支持滑块控制模糊半径和蒙版羽化
            myComp.layer('Inv').effect("ADBE Invert")(blendWI).setValue(100);
            myComp.layer('EdgeBlur').property("Effects").addProperty("ADBE Camera Lens Blur");
            myComp.layer('EdgeBlur').effect("ADBE Camera Lens Blur")(BlurRad).expression = 'thisComp.layer("Control").effect("Blur Radius")("' + slider + '")';
            myComp.layer('Control').mask(1).maskFeather.expression = 'temp = effect("Mask Feather")("' + slider + '");[temp, temp]';
            myComp.layer('Control').effect("Blur Radius")(slider).setValue(10);//默认模糊半径
            myComp.layer('Control').effect("Mask Feather")(slider).setValue(200)//默认蒙版羽化
        }
       

     //深度图添加表达式   
      myComp.layer("White").mask(1).maskPath.expression = 'comp("' + activeCompName + '").layer("Control").mask("Control Mask").maskPath';
      myComp.layer("White").mask(1).maskFeather.expression = 'comp("' + activeCompName + '").layer("Control").mask("Control Mask").maskFeather';
      myComp.layer("White").mask(1).maskOpacity.expression = 'comp("' + activeCompName + '").layer("Control").mask("Control Mask").maskOpacity';
      myComp.layer("White").mask(1).maskExpansion.expression = 'comp("' + activeCompName + '").layer("Control").mask("Control Mask").maskExpansion';
    //预合成 并隐藏深度图
      myLayers.precompose([3,4,5],'DepthComp',true);
      myComp.layer('DepthComp').enabled=false;
      myComp.layer('Control').enabled=false;
      myComp.layer('DepthComp').moveToBeginning();

     // myComp.layer('EdgeBlur').shy = true;
      myComp.layer('DepthComp').shy = true;
      myComp.hideShyLayers = true;


      
        

     }
     // UI 结束区（展示）
     palette.layout.layout(true);
     palette.layout.resize();
     palette.onResizing = palette.onResize = function () { this.layout.resize(); }
 
     if (palette instanceof Window) palette.show();
 
     return palette;
 
 }());
/**************************************************************************************/
/**************************************************************************************/
/**************************************************************************************/
