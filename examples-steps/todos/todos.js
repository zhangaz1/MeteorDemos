Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
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
            Tasks.insert({
                text: text,
                createdAt: new Date()
            });

            event.target.text.value = '';
        },
        'change .hide-completed input': function(events) {
            Session.set('hideCompleted', event.target.checked);
        }
    });

    Template.task.events({
        'click .toggle-checked': function() {
            Tasks.update(this._id, {
                $set: {
                    checked: !this.checked
                }
            });
        },
        'click .delete': function() {
            Tasks.remove(this._id);
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}