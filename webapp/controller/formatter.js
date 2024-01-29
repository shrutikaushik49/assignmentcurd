sap.ui.define([], () => {
	"use strict";

	return {



getPoistionkey: function (sPoistion) {
    let key = 0;
    switch (sPoistion) {
        case "GET":
            key = 0;
            break;
        case "Solution Developer":
            key = 1;
            break;
        case "Team Lead":
            key = 2;
            break;
            case "Manager":
            key = 3;
            break;
    }
    return key;
},
getPoistionkey: function (sCountryCode) {
    let key = 0;
    switch (sCountryCode) {
        case "+ 91":
            key = 0;
            break;
        case "+ 1":
            key = 1;
            break;
        case "+ 2":
            key = 2;
            break;
            
    }
    return key;
}

    }
});