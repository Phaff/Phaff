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
        annotations = annotations.shift().match(/@(\w+)=*(".*")?/g);
        let annotationMap = new Map();
        if (annotations.shift() === '@Phaff') {
            annotations.forEach(function(annotation, i, array) {
                let keyMatch = annotation.match(/@(\w+)/);
                let valueMatch = annotation.match(/="?([\w\/]+)"?/);
                annotationMap.set(keyMatch[1], valueMatch === null || valueMatch[1])
            });
        }
        return annotationMap;
    }
}

var exports = module.exports = FunctionUtils;