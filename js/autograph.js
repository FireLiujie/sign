var businessId = String(Math.random() * 10).substring(3, 8); //集成信手书业务的唯一标识

$(function() {
  // 测试999999，生产40010618
  testAnySign("40010618");
  testSetTemplateData();
  apiInstance.showSignatureDialog("20");
});

// 信手书API初始化
function testAnySign(channel) {
  var res;

  //识别回调接口
  var identify_callback = function(errCode) {
    if (errCode == SUCCESS) {
      return;
    }
    if (errCode == DATA_CANNOT_PARSED) {
      alert("输入数据项无法解析！");
    } else if (errCode == SERVICE_SYSTEM_EXCEPTION) {
      alert("服务系统异常错误！");
    } else if (errCode == RECOGNITION_RESULT_EMPTY) {
      alert("识别结果为空！");
    } else if (errCode == CONNECTION_SERVICE_TIMEOUT) {
      alert("连接识别服务超时！");
    } else if (errCode == CONNECTION_RECOGNITION_EXCEPTION) {
      alert("连接识别服务异常！");
    } else if (errCode == RECOGNITION_FALSE) {
      alert("书写错误！");
    } else {
      alert(errCode);
    }
  };

  var callback = function(context_id, context_type, val) {
    if (context_type == CALLBACK_TYPE_SIGNATURE) {
      //签名回显
      document.getElementById("xss_20").src = "data:image/png;base64," + val;
      var aImg = document.getElementById("xss_20");
      for (var i = 0; i < aImg.length; i++) {
        aImg[i].style.height = "1500";
        aImg[i].style.width = "1500";
      }
    }

    testGenData();
  }; //测试回调，将回调数据显示

  //设置签名算法，默认为RSA，可以设置成SM2为生产加密方式
  // EncAlgType.EncAlg = "RSA";
  EncAlgType.EncAlg = "SM2";

  apiInstance = new AnySignApi();
  //初始化签名接口
  res = apiInstance.initAnySignApi(callback, channel);
  setIdentifyCallBack(identify_callback);

  //注册单字签字对象20
  res = testAddSignatureObj(20);
  if (!res) {
    alert("testAddSignatureObj error");
  }

  //将配置提交
  res = apiInstance.commitConfig();
}

//配置模板数据
function testSetTemplateData() {
  //文件数据
  var formData = "<html></html>";
  var template_serial = "4000"; //用于生成PDF的模板ID
  var res;

  //配置JSON格式签名原文
  /**
   * 设置表单数据，每次业务都需要set一次
   * @param template_type 签名所用的模板类型
   * @param contentUtf8Str 表单数据，类型为Utf8字符串
   * @param businessId 业务工单号
   * @param template_serial 模板序列号
   * @returns {*} 是否设置成功
   */
  res = apiInstance.setTemplate(
    TemplateType.PDF,
    formData,
    businessId,
    template_serial
  );
}

function sign_submit() {
  var signInfo = JSON.parse(localStorage.getItem("signInfo"));
  var originUrl = signInfo.originUrl;
  var imgBase64Data = $("#imgBase64Data").val();
  var originStatus = signInfo.originStatus;
  var attachmentShow = localStorage.getItem("attachmentShow");
  var signVal = localStorage.getItem("sign-val");
  var base64Show = $("#xss_20").attr("src");
  if (originStatus == "1") {
    var appntSignList = JSON.parse(localStorage.getItem("sign-appnt"));
    appntSignList.forEach(item => {
      if (item.documentType == "3") {
        item.baseEncryp = imgBase64Data;
        item.isSign = true;
        item.base64 = base64Show;
      }
    });
    localStorage.setItem("sign-appnt", JSON.stringify(appntSignList));
  } else if (originStatus == "2") {
    var appntSignList = JSON.parse(localStorage.getItem("sign-appnt"));
    var riskCode = signInfo.riskCode;
    appntSignList.forEach(item => {
      if (item.riskCode == riskCode) {
        item.baseEncryp = imgBase64Data;
        item.isSign = true;
        item.base64 = base64Show;
      }
    });
    localStorage.setItem("sign-appnt", JSON.stringify(appntSignList));
  } else if (originStatus == "3") {
    if (attachmentShow == "0") {
      var appntSignList = JSON.parse(localStorage.getItem("sign-appnt"));
      var insuredSign = JSON.parse(localStorage.getItem("sign-insured"));
      if (signVal == "0" || signVal == "2") {
        appntSignList.forEach(item => {
          if (item.documentType == "1") {
            item.baseEncryp = imgBase64Data;
            item.isSign = true;
            item.base64 = base64Show;
          }
        });
        localStorage.setItem("sign-appnt", JSON.stringify(appntSignList));
      } else {
        insuredSign.sign.baseEncryp = imgBase64Data;
        insuredSign.sign.isSign = true;
        insuredSign.sign.base64 = base64Show;
        localStorage.setItem("sign-insured", JSON.stringify(insuredSign));
      }
    } else {
      var appntSign = JSON.parse(localStorage.getItem("sign-appnt"));
      var insuredSign = JSON.parse(localStorage.getItem("sign-insured"));
      if (signVal == "0" || signVal == "2") {
        appntSign.sign.baseEncryp = imgBase64Data;
        appntSign.sign.isSign = true;
        appntSign.sign.base64 = base64Show;
        localStorage.setItem("sign-appnt", JSON.stringify(appntSign));
      } else {
        insuredSign.sign.baseEncryp = imgBase64Data;
        insuredSign.sign.isSign = true;
        insuredSign.sign.base64 = base64Show;
        localStorage.setItem("sign-insured", JSON.stringify(insuredSign));
      }
    }
    sessionStorage.setItem("wxSigned", true);
  } else if (originStatus == "4") {
    sessionStorage.setItem("imgBase64Data", imgBase64Data);
    sessionStorage.setItem("wxSigned", true);
    sessionStorage.setItem("base64", base64Show);
  }
  location.href = originUrl;
}
function testGenData() {
  var res = document.getElementById("result");

  try {
    res.value = apiInstance.getUploadDataGram(); // 生成签名请求加密包
    console.log("````````````加密包``````````");
    console.log(res.value);
    $("#imgBase64Data").val(res.value);
    sign_submit();
  } catch (err) {
    alert(err);
  }
}

function cancelSign() {
  var signInfo = JSON.parse(localStorage.getItem("signInfo"));
  var originUrl = signInfo.originUrl;
  location.href = originUrl;
}
