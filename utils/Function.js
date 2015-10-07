"use strict";

class FunctionUtils {
    static getArgsName(func) {
        return (func + '').replace(/\s+/g,'')
            .replace(/[/][*][^/*]*[*][/]/g,'') // strip simple comments
            .split('){',1)[0].replace(/^[^(]*[(]/,'') // extract the parameters
            .replace(/=[^,]+/g,'') // strip any ES6 defaults
            .split(',').filter(Boolean); // split & filter [""]
    }
    static getPhaffAnnotations(func) {
        let annotations = (func + '').match(/\/\*\*\@Phaff(([\S\s]*?).)\*\//g);
        if (annotations === null) {
            return new Map();
        }
        annotations = annotations.shift().match(/@(\w+)=*(["|\[].*["|\]])?/g);
        let annotationMap = new Map();
        if (annotations.shift() === '@Phaff') {
            annotations.forEach(function(annotation) {
                let key = annotation.match(/@(\w+)/)[1];
                let valueMatch = annotation.match(/="?([\w\/]+)"?/);

                let value;
                if (valueMatch !== null && valueMatch[1]) {
                    value = valueMatch[1];
                } else {
                    let list = annotation.match(/=\[\s*([^)]+?)\s*\]/);
                    if (list !== null) {
                        value = list[1].split(/\s*,\s*/).map((value) => value.replace(/^\s+|"+|\s+$/g,''));
                    }
                }

                //If no value found, assume boolean set to true.
                if ("undefined" === typeof value ) {
                    value = true;
                }
                annotationMap.set(key, value)
            });
        }
        return annotationMap;
    }
}

var exports = module.exports = FunctionUtils;