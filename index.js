const express = require('express')
const bodyParser = require('body-parser')
const AD = require('ad')
const funct = require('./functions.js')

const app = express()
const PORT = process.env.PORT || 8080


//LDAP
const ad = new AD({
    url: 'ldap://127.0.0.1',
    user: 'Administrateur@domain.org',
    pass: 'G2jambes'

})

//BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))



app.use((req, res, next) => {
    next()
    console.log('REQUEST: ' + req.method + ' ' + req.url)
})

app.set('views', 'F:\\api\\views')
app.set('view engine', 'pug')

app.get('/', (req, res, next) => {
    res.format({
        html:() => {
            res.send('Bienvenue sur mon api')
        },
        json: () => {
            res.send({message:'Bienvenue sur mon api'})
        }
    })

})

//-----tester-----//
app.get('/test', (req, res, next) => {
    res.render('test', {
        message: "bonjour"
    })
})


//-----Organization Units-----//

// get all OU
app.get('/organization-units/get', (req, res, next) => {
    ad.ou().get().then((ous) => {
        res.format({
            html: () => {
                let listOU = []
                ous.forEach((ou) => {
                    listOU.push(funct.getOUName(ou.dn))
                })
                res.render('getOUs', {
                    listOU: listOU,
                    title: "liste d'unité d'organisation"
                })
            },
            json: () => {
                res.send(ous)
            }
        })
    })
})

// get one OU
app.get('/organization-units/get/:name', (req, res, next) => {
    ad.ou(req.params.name).get().then((ou) => {
        res.format({
            html: () => {
                const name = funct.getOUName(ou.dn)
                res.render('getOU', {
                    name: name,
                    ou: ou,
                    location: funct.getOUPath(ou.dn)
                })
            },
            json: () => {
                res.send(ou)
            }
        })

    })
})

// add OU
app.get('/organization-units/create', (req, res) => {
    res.render('createOU', {
        title: "create new OU",
        action: "/organization-units/create"
    })
})

app.post('/organization-units/create', (req, res, next) => {
    ad.ou().add(req.body).then(() => {
        res.redirect('/organization-units/get')
    })
})

//remove OU
app.get('/organization-units/delete/:name', (req, res, next) => {
    ad.ou(req.params.name).remove()
        .then(() => {
            res.redirect('/organization-units/get')
        }).catch(next)
})

//-----Groups-----//

//get all groups
app.get('/groups/get', (req, res, next) => {
    ad.group().get().then((groups) => {
        res.format({
            html: () => {
                res.render('getGroups', {
                    groups: groups,
                    title: "liste des groupes"
                })
            },
            json: () => {
                res.send(groups)
            }
        })
    })
})

//get one group
app.get('/groups/get/:name', (req, res, next) => {
    ad.group(req.params.name).get().then((groups) => {
        res.format({
            html: () => {
                res.render('getGroup', {
                    title: 'Group',
                    group: groups,
                })
            },
            json: () => {
                res.send(groups)
            }
        })
    })
})

//add a group
app.get('/groups/create', (req, res, next) => {
    res.render('createGroup', {
        title: 'Create a new group',
        action:'/groups/create'
    })
})

app.post('/groups/create', (req, res, next) => {
    ad.group().add(req.body).then(() => {
        res.redirect('/groups/get')
    })
})

//delete group
app.get('/groups/delete/:name', (req, res, next) => {
    ad.group(req.params.name).remove()
        .then(() => {
            res.redirect('/groups/get')
        })
})

//add User to Group
app.put('/groups/:name/add-user/:username', (req, res, next) => {
    ad.group(req.params.name).addUser(req.params.username)
        .then(() => {
            res.send(`User ${req.body.userName} has been added to the group ${req.params.name} with success`)
        })
})
//TODO
//remove User to Group
app.put('/groups/:name/remove-user/:username', (req, res, next) => {
    ad.group(req.params.name).removeUser(req.params.username)
        .then(() => {
            res.send(`User ${req.body.userName} has been removed from the group ${req.params.name} with success`)
        })
})

//-----Users-----//

//get all Users
app.get('/users/get', (req, res, next) => {
    ad.user().get().then((users) => {
        res.format({
            html: () => {
                res.render('getUsers', {
                    users: users,
                    title: "liste des Users"
                })
            },
            json: () => {
                res.send(users)
            }
        })
    })
})

//get one user
app.get('/users/get/:name', (req, res, next) => {
    ad.user(req.params.name).get().then((users) => {
        res.format({
            html: () => {
                res.render('getUser', {
                    users: users,
                    title: users.cn
                })
            },
            json: () => {
                res.send(users)
            }
        })
    })
})

//create an User
app.get('/users/create', (req, res, next) => {
    res.render('createUser', {
        title: 'Create a new User',
        action:'/users/create'
    })
})

app.post('/users/create', (req, res, next) => {
    ad.user().add(req.body).then(() => {
        res.redirect('/users/get')
    })
    // res.redirect('/users/get')
})

//add User in Group
app.put('/users/:username/add-to/:name', (req, res, next) => {
    ad.user(req.params.username).addToGroup(req.params.name)
        .then(() => {
            res.send(`User ${req.params.username} has been added to the group ${req.body.name} with success`)
        })
})

//remove User in Group
app.put('/users/:username/remove-from/:name', (req, res, next) => {
    ad.user(req.params.username).removeFromGroup(req.params.name)
        .then(() => {
            res.send(`User ${req.params.username} has been removed from the group ${req.body.name} with success`)
        })
})

//remove User
app.get('/users/delete/:username', (req, res, next) => {
    ad.user(req.params.username).remove()
        .then(() => {
            res.redirect('/users/get')
        })
})


app.use((err, req, res, next) => {
    console.log('ERR: ' + err)
    res.status(500)
    res.send('Server Error')
})

app.listen(PORT, () => {
    console.log('Server running on port: ' + PORT)
})

