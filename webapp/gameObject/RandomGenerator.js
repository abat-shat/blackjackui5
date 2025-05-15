sap.ui.define([], function(){
    class RandomGenerator {
        /**
         * 
         * @param {int} max 
         * @param {int} min 
         */
        static nextInt(max, min = 0) {
            return Math.floor(Math.random() * (max - min) ) + min;
        }
    }  
    return RandomGenerator;
});