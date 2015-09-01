Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
    Meteor.subscribe('tasks');

    // This code only runs on the client
    Template.body.helpers({
        tasks: function() {
            var query = {};

            if (Session.get('hideCompleted')) {
                query.checked = {
                    $ne: true
                };
            }

            return Tasks.find(query, {
                sort: {
                    createdAt: -1
                }
            });
        },
        hideCompleted: function() {
            return Session.get('hideCompleted');
        },
        incompleteCount: function() {
            return Tasks.find({
                checked: {
                    $ne: true
                }
            }).count();
        }
    });

    Template.body.events({
        'submit .new-task': function(event) {
            event.preventDefault();

            var text = event.target.text.value;
            Meteor.call('addTask', text);

            event.target.text.value = '';
        },
        'change .hide-completed input': function(events) {
            Session.set('hideCompleted', event.target.checked);
        }
    });

    Template.task.helpers({
        isOwner: function() {
            return this.owner === Meteor.userId();
        }
    });

    Template.task.events({
        'click .toggle-checked': function(event) {
            event.preventDefault();
            Meteor.call('setChecked', this._id, !this.checked);
        },
        'click .delete': function() {
            Meteor.call('deleteTask', this._id);
        },
        'click .toggle-private': function() {
            Meteor.call('setPrivate', this._id, !this.private)
        }
    });

    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_ONLY'
    });
}

function checkAuth() {
    if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
    }
}

Meteor.methods({
    addTask: function(text) {
        checkAuth();

        Tasks.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
    },
    deleteTask: function(taskId) {
        checkAuth();

        Tasks.remove(taskId);
    },
    setChecked: function(taskId, setChecked) {
        checkAuth();

        Tasks.update(taskId, {
            $set: {
                checked: setChecked
            }
        });
    },
    setPrivate: function(taskId, setToPrivate) {
        var task = Tasks.findOne(taskId);

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, {
            $set: {
                private: setToPrivate
            }
        });
    }
});

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });

    Meteor.publish('tasks', function() {
        return Tasks.find();
    });
}