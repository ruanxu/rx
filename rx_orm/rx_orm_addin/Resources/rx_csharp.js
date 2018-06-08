﻿//C#_____String
String.Format = function (text) {
    for (var i = 1; i < arguments.length; i++) {
        text = text.replace("{" + (i - 1) + "}", arguments[i]);
    }
    return text;
}

String.IsNullOrEmpty = function (text) {
    return (text == null || text == "") ? true : false;
}

String.IsNullOrWhiteSpace = function (text) {
    return (text == null || text.trim() == "") ? true : false;
}

String.Join = function (separator, list) {
    var str = "";
    var index = 0;
    for (var key in list) {
        if (index != 0) {
            str += separator;
        }
        if (!(list[key] instanceof Function)) {
            str += list[key];
            index++;
        }
    }
    return str;
}

//C#_____ArrayList
function ArrayList() {

}
ArrayList = Array;

ArrayList.prototype.Add = function (obj) {
    this[this.length] = obj;
    return true;
}

ArrayList.prototype.Insert = function (index, obj) {
    if (this.length > 0) {
        if (index >= this.length) {
            alert("集合外越界！");
            return false;
        }
        else if (index < 0) {
            alert("集合内越界！");
            return false;
        }
    }
    else if (this.length == 0) {
        if (index == 0) {
            return this.Add(obj);
        }
        else if (index >= this.length) {
            alert("集合外越界！");
            return false;
        }
        else if (index < 0) {
            alert("集合内越界！");
            return false;
        }
    }

    for (var i = index; i < length + 1; i++) {
        this[i + 1] = this[i];
    }
    this[index] = obj;
    return true;
}

ArrayList.prototype.Remove = function (obj) {
    var reg = false;
    for (var i = 0; i < this.length; i++) {
        if (this[i] == obj) {
            for (var j = i; j < this.length - 1; j++) {
                this[j] = this[j + 1];
            }
            this.length -= 1;
            reg = true;
            break;
        }
    }
    return reg;
}

ArrayList.prototype.RemoveAt = function (index) {
    if (index >= this.length) {
        alert("集合外越界！");
        return false;
    }
    else if (index < 0) {
        alert("集合内越界！");
        return false;
    }
    for (var i = index; i < this.length - 1; i++) {
        this[i] = this[i + 1];
    }
    this.length -= 1;
    return true;
}

Array.prototype.Contains = function (value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == value) {
            return true;
        }
    }
    return false;
}

Array.prototype.Distinct = function () {
    var n = [];
    for (var i = 0; i < this.length; i++) {
        if (n.indexOf(array[i]) == -1) n.push(array[i]);
    }
    return n;
}

//控制台
var Console = {};
Console.WriteLine = function (text) {
    console.info(text);
}

Console.ReadLine = function (message) {
    return prompt(message == undefined ? "" : message, "")
}





