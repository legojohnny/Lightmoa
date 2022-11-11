//===========================
//상품진열
//===========================

let products = [];
let cart = [];

$.get("store.json").then((data) => {
  products = data.products;

  //페이지로드시 json 데이터가져와서 메인페이지 상품 목록 만들기
  data.products.forEach((a, i) => {
    $(".product-list").append(`
          <div class="col-md-3">
            <div class="item" draggable="true" data-id="${a.id}">
              <div class="imgBox"><img src="https://legojohnny.github.io/Lightmoa/${a.photo}" draggable="false"></div>
              <h4>${a.title}</h4>
              <h4>${a.brand}</h4>
              <p>가격 : ${a.price} 원</p>
              <button class="add" data-id="${a.id}">담기</button>
            </div>
          </div>`);
  });

  //========================
  //담기버튼 누르면
  //========================

  $(".add").click(function (e) {
    //지금누른 상품번호
    let productId = e.target.dataset.id;

    // 지금누른 상품번호와 id가 일치하는 cart 내 상품 인덱스 찾기
    let productIndex = cart.findIndex((a) => {
      return a.id == productId;
    });
    // 일치하는 상품이 없으면
    if (productIndex == -1) {
      // 지금누른 상품번호와 일치하는 id의 상품을 products에서 찾아서
      let clickedProduct = products.find((a) => {
        return a.id == productId;
      });
      // count를 1로 하고
      clickedProduct.count = 1;
      // cart에 추가해주기
      cart.push(clickedProduct);
    }
    // 일치하는 상품이 있으면
    else {
      // count만 증가시키기
      cart[productIndex].count++;
    }

    //담기버튼 누를 때 마다 장바구니 박스에 cart 안에 있던 상품수만큼 html 생성
    $(".basket").html("");
    cart.forEach((a, i) => {
      $(".basket").append(`
            <div class="col-md-3 bg-white">
              <img src="https://legojohnny.github.io/Lightmoa/${a.photo}" draggable="false">
              <h4>${a.title}</h4>
              <h4>${a.brand}</h4>
              <p>${a.price}</p>
              <input type="number" value="${a.count}" class="item-count w-100" data-id="${a.id}">
            </div>
          `);
    });

    //총가격 계산
    totalPrice();

    //input값 변경될때에도 총가격 계산
    $(".item-count").on("input", function (e) {
      let productId = e.target.dataset.id;
      let productIndex = cart.findIndex((a) => {
        return a.id == productId;
      });
      cart[productIndex].count++;
      totalPrice();
    });
  });

  //===================
  //.item 드래그로 장바구니에 추가
  //===================

  $(".item").on("dragstart", function (e) {
    // 지금누른 상품의 id 를 저장
    e.originalEvent.dataTransfer.setData("id", e.target.dataset.id);
  });

  $(".basket").on("dragover", function (e) {
    e.preventDefault();
  });

  $(".basket").on("drop", function (e) {
    // 저장된 id 가져오기
    let productId = e.originalEvent.dataTransfer.getData("id");

    // 드래그 시 장바구니에 추가하는 기능은 저장된 id를 가져올때
    // 해당 id의 담기버튼이 눌린것처럼 동작해서 추가하기
    $(".add").eq(productId).click();
  });
});

//===========================
//총가격 계산
//===========================

function totalPrice() {
  let finalPrice = 0;

  for (let i = 0; i < $(".item-count").length; i++) {
    var count = $(".item-count").eq(i).val();
    var price = $(".item-count").eq(i).siblings("p").text();
    finalPrice += parseFloat(price * count);
  }

  $(".final-price").html("합계 : " + finalPrice + " 원");
}

//===========================
//주문 누르면 뜨는 모달창, 영수증
//===========================

// 구매하기 버튼 누르면 모달창 띄우기
$(".buy").click(function () {
  $(".modalInfo").css("display", "block");
});

//모달창에 입력된 정보는 변수에 저장해둠
let customer = "";
let contact = "";

$("#name").on("input", function () {
  customer = $("#name").val();
});

$("#phone").on("input", function () {
  contact = $("#phone").val();
});

//모달창의 완료버튼 누르면 영수증 보여줌
//영수증에 canvas태그로 그림그려줌
$(".modalInfo form").on("submit", function (e) {
  // 입력된 정보 공백 및 정규식 확인
  var regCustomer = /^[가-힣a-zA-Z]+$/;
  var regContact = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/;

  if (customer == "") {
    e.preventDefault();
    alert("성함을 입력해주세요");
  } else if (!regCustomer.test(customer)) {
    e.preventDefault();
    alert("한글이나 영문만 입력해주세요");
  }
  if (regContact == "") {
    e.preventDefault();
    alert("연락처를 입력해주세요");
  } else if (!regContact.test(contact)) {
    e.preventDefault();
    alert("숫자만 입력해주세요");
  } else {
    e.preventDefault();
    // 영수증 canvas 기능
    $(".modalInfo").css("display", "none");
    $(".modalReceipt").css("display", "block");
    var canvas = document.getElementById("canvas");
    var c = canvas.getContext("2d"); // 렌더링 컨텍스트 타입은 2d

    c.font = "1rem Noto Sans KR";
    c.fillText("구매자 : " + customer, 20, 30);
    c.fillText("연락처 : " + contact, 20, 60);
    c.fillText($(".final-price").html(), 20, 90);
    cart.forEach((a, i) => {
      var productName = a.title;
      var productCount = $(".item-count").eq(i).val();
      c.fillText(
        "상품명 : " + productName + " (수량 : " + productCount + " )",
        20,
        120 + 30 * i
      );
    });
  }
});

//===========================
//검색기능
//===========================

$("#search").on("input", function () {
  let searchText = $("#search").val();

  //지금입력한 글자가 제목에 있으면 products에서 검색어있는 것만 남기기

  let newProducts = products.filter((a) => {
    return a.title.includes(searchText) || a.brand.includes(searchText);
  });

  $(".product-list").html("");
  newProducts.forEach((a, i) => {
    $(".product-list").append(`
          <div class="col-md-3">
            <div class="item" draggable="true" data-id="${a.id}">
            <div class="imgBox"><img src="https://legojohnny.github.io/Lightmoa/${a.photo}"></div>
              <h4>${a.title}</h4>
              <h4>${a.brand}</h4>
              <p>가격 : ${a.price}</p>
              <button class="add" data-id="${a.id}">담기</button>
            </div>
          </div>`);
  });

  $(".product-list h4").each(function (i, htmlElement) {
    let title = htmlElement.innerHTML;
    title = title.replace(
      searchText,
      `<span style="background : yellow">${searchText}</span>`
    );

    htmlElement.innerHTML = title;
  });

  //========================
  //담기버튼 누르면
  //========================

  $(".add").click(function (e) {
    //지금누른 상품번호
    let productId = e.target.dataset.id;

    // 지금누른 상품번호와 id가 일치하는 cart 내 상품 인덱스 찾기
    let productIndex = cart.findIndex((a) => {
      return a.id == productId;
    });
    // 일치하는 상품이 없으면
    if (productIndex == -1) {
      // 지금누른 상품번호와 일치하는 id의 상품을 products에서 찾아서
      let clickedProduct = products.find((a) => {
        return a.id == productId;
      });
      // count를 1로 하고
      clickedProduct.count = 1;
      // cart에 추가해주기
      cart.push(clickedProduct);
    }
    // 일치하는 상품이 있으면
    else {
      // count만 증가시키기
      cart[productIndex].count++;
    }

    //담기버튼 누를 때 마다 장바구니 박스에 cart 안에 있던 상품수만큼 html 생성
    $(".basket").html("");
    cart.forEach((a, i) => {
      $(".basket").append(`
            <div class="col-md-3 bg-white">
              <img src="https://legojohnny.github.io/Lightmoa/${a.photo}" draggable="false">
              <h4>${a.title}</h4>
              <h4>${a.brand}</h4>
              <p>${a.price}</p>
              <input type="number" value="${a.count}" class="item-count w-100" data-id="${a.id}">
            </div>
          `);
    });

    //총가격 계산
    totalPrice();

    //input값 변경될때에도 총가격 계산
    $(".item-count").on("input", function (e) {
      let productId = e.target.dataset.id;
      let productIndex = cart.findIndex((a) => {
        return a.id == productId;
      });
      cart[productIndex].count++;
      totalPrice();
    });
  });
});

//===========================
//모달창 2개 닫기 기능
//===========================

$(".close").click(function (e) {
  //그냥 2개 동시에 닫음
  $(e.target).parents(".modalInfo").css("display", "none");
  $(e.target).parents(".modalReceipt").css("display", "none");
  $("#name").val("");
  $("#phone").val("");
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
});
