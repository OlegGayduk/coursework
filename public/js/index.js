'use strict';

class Client {
	constructor() {

        this.arr = ["AUD","AZN","GBP","AMD","BYN","BGN","BRL","HUF","HKD","DKK","USD","EUR",
        "INR","KZT","CAD","KGS","CNY","MDL","NOK","PLN","RON","XDR","SGD","TJS","TRY","TMT",
        "UZS","UAH","CZK","SEK","CHF","ZAR","KRW","JPY"];

        this.xhr = this.getXhrType();

        this.check();

        this.getUserData();

        this.transInit();

        this.request();

        this.values = [];

        this.alias = 0;

        this.pairs = [];
	}

    getXhrType() {

        let x;
    
        try {
            x = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                x = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                x = 0;
            }
        }
    
        if(!x && typeof XMLHttpRequest != 'undefined') x = new XMLHttpRequest();
    
        return x;
    }

    check() {

        const xhr = this.xhr;

        xhr.onload = xhr.onerror = function() {

            document.getElementsByClassName('media-progress')[0].style.width = "0px";
        
            if(xhr.status == 200) {
                if(xhr.response == 0) window.location.href = "/";
            } else {
                alert("Error in request! Please come later!");
            } 
        }.bind(this);

        xhr.onprogress = function(event) {
            document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
        };
        
        xhr.open('GET', "https://courseworkgayduk.herokuapp.com/login_check", true);
        
        xhr.send();
    }

    sanitize(text) {
        return text.replace(/<script>|[\t\r\n]|(--[^\r\n]*)|(\/\*[\w\W]*?(?=\*)\*\/)/gim, "");
    }

	request() {
		$.getJSON("https://www.cbr-xml-daily.ru/daily_json.js", function(data) {

        	let dat = JSON.stringify(data.Valute);
        
            for(var i = 0;i < 34;i++) {
                dat = dat.replace(this.arr[i],i);
        	}
        
        	dat = JSON.parse(dat);

            let u = 3;
        
        	for(let i = 0;i < 34;i++) {
                this.values[i] = dat[i].Value;
                $(".list").append("<div id="+(i+1)+" class='list-child'>" + dat[i].Name + "("+this.arr[i]+")</div>");
                if(dat[i].Value > dat[i].Previous) {
                    if((dat[i].Value - dat[i].Previous).toFixed(u) == 0) while((dat[i].Value - dat[i].Previous).toFixed(u) == 0) u++;
                    $("#"+(i+1)+"").append("<div class='list-child-text-wrap'>" + dat[i].Value.toFixed(3) + "<span style='font-weight:700;color:red;'>+" + (dat[i].Value - dat[i].Previous).toFixed(u) + "</span> Рублей</div>");
                } else if(dat[i].Value < dat[i].Previous) {
                    if((dat[i].Previous - dat[i].Value).toFixed(u) == 0) while((dat[i].Previous - dat[i].Value).toFixed(u) == 0) u++;
                    $("#"+(i+1)+"").append("<div class='list-child-text-wrap'>" + dat[i].Value.toFixed(3) + "<span style='font-weight:700;color:green;'>-" + (dat[i].Previous - dat[i].Value).toFixed(u) + "</span> Рублей</div>");
                } else {
                    $("#"+(i+1)+"").append("<div class='list-child-text-wrap'>"+ dat[i].Value.toFixed(3) + " Рублей</div>");
                }

                u = 3;
            }

            $('.nano').nanoScroller();
        }.bind(this));
	}

    requestRepeat() {
        $.getJSON("https://www.cbr-xml-daily.ru/daily_json.js", function(data) {

            let dat = JSON.stringify(data.Valute);
        
            for(var i = 0;i < 34;i++) {
                dat = dat.replace(this.arr[i],i);
            }
        
            dat = JSON.parse(dat);

            let u = 3;
        
            for(let i = 0;i < 34;i++) {
                if(this.values[i] != dat[i].Value) {
                    if(this.values[i] > dat[i].Value) {
                        if((dat[i].Value - dat[i].Previous).toFixed(u) == 0) while((dat[i].Value - dat[i].Previous).toFixed(u) == 0) u++;
                        document.getElementById(i+1).childNodes[1].innerHTML = dat[i].Value.toFixed(3) + "<span style='font-weight:700;color:green;'>-" + (dat[i].Previous - dat[i].Value).toFixed(u) + "</span> Рублей";
                    } else if(this.values[i] < dat[i].Value) {
                        if((dat[i].Previous - dat[i].Value).toFixed(u) == 0) while((dat[i].Previous - dat[i].Value).toFixed(u) == 0) u++;
                        document.getElementById(i+1).childNodes[1].innerHTML = dat[i].Value.toFixed(3) + "<span style='font-weight:700;color:green;'>+" + (dat[i].Value - dat[i].Previous).toFixed(u) + "</span> Рублей";
                    } else {
                        document.getElementById(i+1).childNodes[1].innerHTML = dat[i].Value.toFixed(3) + " Рублей";
                    }

                    this.values[i] = dat[i].Value;

                    u = 3;

                    for(let u = 0;u < this.pairs.length;u++) {
                        if(this.pairs[i].second_pair == dat[i].Name) if(dat[i].Value <= this.pairs[i].value) this.notification({first_pair:this.pairs[i].first_pair,second_pair:dat[i].Name,value:dat[i].Value});
                    }
                }
            }
        }.bind(this));
    }

    notification(obj) {

        const xhr = this.xhr;

        xhr.onload = xhr.onerror = function() {

            document.getElementsByClassName('media-progress')[0].style.width = "0px";
        
            if(xhr.status == 200) {
                if(xhr.response == 0) alert("Unable to send notification at this moment!");
            } else {
                alert("Error in request! Please come later!");
            } 
        }.bind(this);

        xhr.onprogress = function(event) {
            document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
        };
        
        xhr.open('POST', "https://courseworkgayduk.herokuapp.com/notify", true);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(JSON.stringify(obj));
    }

    transFirst(index) {
        if(document.getElementsByClassName('trans-second')[0].value == "") {
            document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]).toFixed(3);
        } else {
            if(document.getElementsByClassName('trans-first')[0].value != document.getElementsByClassName('trans-second')[0].value) {
                if(document.getElementsByClassName('trans-first')[0].value == "") {
                    document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-second')[0].options.selectedIndex - 1]).toFixed(3);
                } else {
                    document.getElementsByClassName('second')[0].value = ((document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]) / (this.values[document.getElementsByClassName('trans-second')[0].options.selectedIndex - 1])).toFixed(3);
                }
            } else {
                document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]).toFixed(3);
            }
        }
    } 

    transSecond(index) {
        if(document.getElementsByClassName('trans-second')[0].value == "") {
            document.getElementsByClassName('first')[0].value = (document.getElementsByClassName('second')[0].value / this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]).toFixed(3);
        } else {
            if(document.getElementsByClassName('trans-first')[0].value != document.getElementsByClassName('trans-second')[0].value) {
                document.getElementsByClassName('first')[0].value = ((document.getElementsByClassName('second')[0].value * this.values[document.getElementsByClassName('trans-second')[0].options.selectedIndex - 1]) / (this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1])).toFixed(3);;
            } else {
                document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]).toFixed(3);
            }
        }
    }

    translate() {
        if(document.getElementsByClassName('first')[0].value == "" || document.getElementsByClassName('first')[0].value == 0) document.getElementsByClassName('first')[0].value = 1;
        if(document.getElementsByClassName('trans-second')[0].value == "") {
            document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]).toFixed(3);
        } else {
            if(document.getElementsByClassName('trans-first')[0].value != document.getElementsByClassName('trans-second')[0].value) {
                if(document.getElementsByClassName('trans-first')[0].value == "") {
                    document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-second')[0].options.selectedIndex - 1]).toFixed(3);
                } else {
                    document.getElementsByClassName('second')[0].value = ((document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]) / (this.values[document.getElementsByClassName('trans-second')[0].options.selectedIndex - 1])).toFixed(3);
                }
            } else {
                document.getElementsByClassName('second')[0].value = (document.getElementsByClassName('first')[0].value * this.values[document.getElementsByClassName('trans-first')[0].options.selectedIndex - 1]).toFixed(3);
            }
        }
    }

    getUserData() {

        const xhr = this.xhr;

        xhr.onload = xhr.onerror = function() {

            document.getElementsByClassName('media-progress')[0].style.width = "0px";
        
            if(xhr.status == 200) {
                if(xhr.response != 0) {
                    $(".alias").append(JSON.parse(xhr.response)[0]);

                    if(JSON.parse(xhr.response)[1] != 0) {
                        this.pairs = JSON.parse(xhr.response)[1];
                        for(let i = 0;i < this.pairs.length;i++) {
                            $('.tracking-pairs').append("<div id='" + this.pairs[i].id + "' class='tracking-value'>" + this.pairs[i].first_pair + " в " + this.pairs[i].second_pair + " " + this.pairs[i].second_pair + "<=" + this.pairs[i].value + "<div class='delete-pair-btn' onclick='client.deletePair("+this.pairs[i].id+")'></div></div>");
                        }

                        $('.nano').nanoScroller();
                    } else {
                        document.getElementsByClassName('tracking-pairs')[0].innerHTML = "<div class='tracking-error'>Список пуст.</div>";
                    }

                } else {
                    window.location.href = '/';
                }
            } else {
                alert("Error in request! Please come later!");
            } 
        }.bind(this);

        xhr.onprogress = function(event) {
            document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
        };
        
        xhr.open('GET', "https://courseworkgayduk.herokuapp.com/get_user_data", true);
        
        xhr.send();
    }

    transInit() {

        document.getElementsByClassName('trans-choice')[0].innerHTML = "<select class='trans-first' onchange='client.translate()'></select>";
        
        $('.trans-first').append("<option value='' selected>Выбрать</option>");

        $('.trans-choice').append("<select class='trans-second' onchange='client.translate()'></select>");
        
        $('.trans-second').append("<option value='' selected>Выбрать</option>");

        for(let i = 0;i < 34;i++) {
            $('.trans-first').append("<option>"+this.arr[i]+"</option>");
            $('.trans-second').append("<option>"+this.arr[i]+"</option>");
        }

        $('.translate').append("<input type='button' value='Отслеживать выбранную пару' class='tracking-btn' onclick='client.tracking()'/>");
    }

    tracking() {

        let first = this.sanitize(document.getElementsByClassName('trans-first')[0].value);
        let second = this.sanitize(document.getElementsByClassName('trans-second')[0].value);

        if((first != "" || second != "")) {

            let val = 0;

            for(let i = 0;i < this.pairs.length;i++) {
                if((this.pairs[i].first_pair == first) && (this.pairs[i].second_pair == second)) val = 1;
            }
            
            if(val == 0) {

                var obj = {};
    
                if(first != "" && second != "") {
                    obj = {
                        first_pair: first,
                        second_pair: second
                    };
                } else if(first != "" && second == "") {
                    obj = {
                        first_pair: first,
                        second_pair: "RUB"
                    };
                } else if(first == "" && second != "") {
                    obj = {
                        first_pair: second,
                        second_pair: "RUB"
                    };
                }

                let val = prompt("Сообщать когда "+obj.second_pair+" будет меньше или равен:");

                if (val.replace(/\s/g, '').length === 0 || isNaN(+val) || isNaN(val)) {
                    alert('Напишите число!');
                } else {

                    obj.val = val;
    
                    const xhr = this.xhr;
    
                    xhr.onload = xhr.onerror = function() {
    
                        document.getElementsByClassName('media-progress')[0].style.width = "0px";
                    
                        if(xhr.status == 200) {
                            if(xhr.response != 0) {

                                obj.id = xhr.response;
    
                                if(this.pairs.length == 0) document.getElementsByClassName('tracking-pairs')[0].innerHTML = "";
    
                                this.pairs.push(obj);
    
                                $('.tracking-pairs').append("<div id='" + obj.id + "' class='tracking-value'>" + obj.first_pair + " в " + obj.second_pair + " " + obj.second_pair + "<=" + obj.val + "<div class='delete-pair-btn' onclick='client.deletePair("+obj.id+")'></div></div>");
                                
                                $('.nano').nanoScroller();
                            } else {
                                window.location.href = '/';
                            }
                        } else {
                            alert("Error in request! Please come later!");
                        } 
                    }.bind(this);
    
                    xhr.onprogress = function(event) {
                        document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
                    };
                    
                    xhr.open('POST', "https://courseworkgayduk.herokuapp.com/save_pair", true);
    
                    xhr.setRequestHeader("Content-Type", "application/json");
                    
                    xhr.send(JSON.stringify(obj));
                }
            } else {
                alert("Данная пара уже отслеживается!");
            }
        }
    }

    deletePair(id) {
        
        const xhr = this.xhr;

        xhr.onload = xhr.onerror = function() {

            document.getElementsByClassName('media-progress')[0].style.width = "0px";
        
            if(xhr.status == 200) {
                if(xhr.response != 0) {
                    document.getElementsByClassName('tracking-pairs')[0].removeChild(document.getElementById(id));
                    $('.nano').nanoScroller();
                } else {
                    alert("Error in deleting! Please try again!");
                }
            } else {
                alert("Error in request! Please come later!");
            } 
        }.bind(this);

        xhr.onprogress = function(event) {
            document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
        };
        
        xhr.open('POST', "https://courseworkgayduk.herokuapp.com/delete_pair", true);

        xhr.setRequestHeader("Content-Type", "application/json");
                    
        xhr.send(JSON.stringify({id:id}));
    }

    exit() {
        const xhr = this.xhr;

        xhr.onload = xhr.onerror = function() {

            document.getElementsByClassName('media-progress')[0].style.width = "0px";
        
            if(xhr.status == 200) {
                window.location.href = '/';
            } else {
                alert("Error in request! Please come later!");
            } 
        }.bind(this);

        xhr.onprogress = function(event) {
            document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
        };
        
        xhr.open('GET', "https://courseworkgayduk.herokuapp.com/exit", true);
        
        xhr.send();
    }
}

let client = new Client();

setInterval(function() {
    client.requestRepeat();
}, 5000);
