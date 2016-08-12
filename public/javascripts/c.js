var types = null;
if(typeof localStorage.getItem('favorites') == 'string'){
    types = JSON.parse(localStorage.getItem('favorites'));
}else{
    var types = [
        {
            name: "欧元",
            code: "EUR"
        },
        {
            name: "美元",
            code: "USD"
        },
        {
            name: "英镑",
            code: "GBP"
        },
        {
            name: "人民币",
            code: "CNY"
        },
        {
            name: "日元",
            code: "JPY"
        }
    ];
    localStorage.setItem('favorites', JSON.stringify(types));
}