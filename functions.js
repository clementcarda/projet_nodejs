module.exports = {
    getOUName: function (name) {
        const array = name.split(',')
        const ouname = array[0]
        return ouname.substr(3)
    }, 
    getOUPath: function (dn) {
        const array = dn.split(',')
        let path = ''
        for (let i = 0; i < array.length; i++){
            if (array[i].includes('OU=') && i > 0) {
                path = array[i].substr(3)+'/'+path
            }
        }
        return path.substr(0, path.length-1)
    },
    getUserNotIn: function (groupName) {
        const users = {}

        
    }
}