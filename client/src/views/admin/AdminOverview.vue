<template>
    <div id="adminOverview" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
            <div class="heading">EasyChat</div>
            <ul class="list list-group-flush">
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</li>
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i v-if="privateChatrooms.length" id="privateIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('private')"></i></li>
                <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light privateChatroom"><div class="chatroomIcon"><i :class="privateChatroom.icon"></i></div>{{privateChatroom.name}}</li>
            </ul>
            </div>
            <div id="pageDiv">
                <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                    <button id="toggleSidebar" class="btn btn-info" @click="toggleSidebar"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarOptions" class="collapse navbar-collapse">
                        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                            <li class="nav-item active">
                                <a class="nav-link" href="#">Overview</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#">Users</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a id="userOptions" href="#" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    username
                                </a>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userOptions">
                                    <a class="dropdown-item" href="#">Profile</a>
                                    <a class="dropdown-item" href="#">Change password</a>
                                    <a class="dropdown-item" href="#">Log out</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div id="chatroom">
                    <form autocomplete="off" @submit.prevent="createChatroom">
                        <h1>Chatroom</h1>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <input type="text" id="name" class="form-control" :class="{'errorField' : nameError}" placeholder="Name" v-model="chatroom.name" ref="first" @focus="clearNameStatus" @keyPress="clearNameStatus">
                                <small v-if="nameError" class="form-text errorInput">Please provide a valid name!</small>
                            </div>
                            <div class="form-group col-md-5">
                                <input type="text" id="icon" class="form-control" :class="{'errorField' : iconError}" placeholder="Icon" v-model="chatroom.icon" @focus="clearIconStatus" @keyPress="clearIconStatus">
                                <small v-if="iconError" class="form-text errorInput">Please provide a valid icon!</small>
                            </div>
                            <div class="form-group col-md-1">
                                <button type="submit" class="btn btn-primary">Create</button>
                            </div>
                        </div>
                        <div v-if="chatroomCreated" class="creationSuccessful">Chatroom has been successfully created!</div>
                    </form>
                </div>
                <table class="table">
                    <thead class="thead-light">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Icon</th>
                            <th scope="col">Participants</th>
                            <th scope="col">Blocked</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(publicChatroom, index) in publicChatrooms" :key="publicChatroom._id">
                            <th scope="row">{{++index}}</th>
                            <td v-if="editing == publicChatroom._id"><input type="text" class="form-control" v-model="publicChatroom.name"/></td>
                            <td v-else>{{publicChatroom.name}}</td>
                            <td v-if="editing == publicChatroom._id"><input type="text" class="form-control" v-model="publicChatroom.icon"/></td>
                            <td v-else><i :class="publicChatroom.icon"></i></td>
                            <td v-if="editing == publicChatroom._id" class="padded">
                                <ul>
                                    <li v-for="participant in publicChatroom.participants" :key="participant">{{participant}}<i class="fas fa-ban blockUser" @click="blockParticipant(publicChatroom._id, participant)"></i></li>
                                </ul>
                            </td>
                            <td v-else>{{publicChatroom.participants.join(", ")}}</td>
                            <td v-if="editing == publicChatroom._id" class="padded">
                                <ul>
                                    <li v-for="blockedParticipant in publicChatroom.blockedParticipants" :key="blockedParticipant">{{blockedParticipant}}<i class="fas fa-check allowUser" @click="allowParticipant(publicChatroom._id, blockedParticipant)"></i></li>
                                </ul>
                            </td>
                            <td v-else>{{publicChatroom.blockedParticipants.join(", ")}}</td>
                            <td v-if="editing == publicChatroom._id" class="padded">
                                <i class="far fa-check-circle" @click="editChatroom(publicChatroom)"></i>
                                <i class="far fa-times-circle" @click="disableEditing()"></i>
                            </td>
                            <td v-else>
                                <i class="fas fa-pencil-alt" @click="enableEditing(publicChatroom._id)"></i>
                                <i class="fas fa-trash" @click="deleteChatroom(publicChatroom._id)"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
    import "../../assets/css/bars.css";
    var axios = require("axios");

    export default {
        name: "adminOverview",
        data() {
            return {
                publicChatrooms: [],
                privateChatrooms: [],
                submitting: false,
                nameError: false,
                iconError: false,
                chatroom: {
                    name: "",
                    icon: ""
                },
                chatroomCreated: false,
                editing: null
            }
        },
        methods: {
            createChatroom() {
                this.submitting = true;
                this.clearNameStatus();
                this.clearIconStatus();
                var allowSubmit = true;
                if(this.invalidName) {
                    this.nameError = true;
                    allowSubmit = false;
                }
                if(this.invalidIcon) {
                    this.iconError = true;
                    allowSubmit = false;
                }
                if(!allowSubmit) {
                    this.chatroomCreated = false;
                    return;
                }
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/createChatroom", {
                    name: this.chatroom.name,
                    icon: this.chatroom.icon
                }).then(response => {
                    if(response.data.created) {
                        var newChatroom = response.data.chatroom;
                        this.publicChatrooms = [...this.publicChatrooms, newChatroom];
                        this.chatroomCreated = true;
                        this.$refs.first.focus();
                        this.chatroom = {name: "", icon: ""};
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("name")) this.nameError = true;
                        if(errorFields.includes("icon")) this.iconError = true;
                        this.chatroomCreated = false;
                    }
                }).catch(error => console.log(error));
            },
            clearNameStatus() { this.nameError = false; },
            clearIconStatus() { this.iconError = false; },
            enableEditing(id) { this.editing = id; },
            disableEditing() { this.editing = null; },
            editChatroom(updatedChatroom) {
                if(updatedChatroom.name != "" && updatedChatroom.icon != "") {
                    axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/editChatroom", {
                        _id: updatedChatroom._id,
                        name: updatedChatroom.name,
                        icon: updatedChatroom.icon
                    }).then(response => {
                        if(response.data.edited) {
                            this.publicChatrooms = this.publicChatrooms.map(publicChatroom => publicChatroom._id == updatedChatroom._id ? updatedChatroom : publicChatroom);
                            this.editing = null;
                        }
                    }).catch(error => console.log(error));
                } else {
                    return;
                }
            },
            deleteChatroom(chatroomId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/deleteChatroom/" + chatroomId).then(response => {
                    if(response.data.deleted) {
                        this.publicChatrooms = this.publicChatrooms.filter(publicChatroom => publicChatroom._id != chatroomId);
                    }
                }).catch(error => console.log(error));
            },
            blockParticipant(chatroomId, participant) {
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/blockParticipant", {
                    _id: chatroomId,
                    participant: participant
                }).then(response => {
                    if(response.data.blocked) {
                        var updatedChatroom = response.data.chatroom;
                        this.publicChatrooms = this.publicChatrooms.map(publicChatroom => publicChatroom._id == updatedChatroom._id ? updatedChatroom : publicChatroom);
                    }
                }).catch(error => console.log(error));
            },
            allowParticipant(chatroomId, participant) {
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/allowParticipant", {
                    _id: chatroomId,
                    participant: participant
                }).then(response => {
                    if(response.data.allowed) {
                        var updatedChatroom = response.data.chatroom;
                        this.publicChatrooms = this.publicChatrooms.map(publicChatroom => publicChatroom._id == updatedChatroom._id ? updatedChatroom : publicChatroom);
                    }
                }).catch(error => console.log(error));
            },
            toggleChatrooms(type) {
                if(type == "public") {
                    var publicChatrooms = document.querySelectorAll(".publicChatroom");
                    var publicIcon = document.getElementById("publicIcon");
                    publicChatrooms.forEach(publicChatroom => {
                        if(publicChatroom.classList.contains("hiddenPublicChatroom")) {
                            publicChatroom.classList.remove("hiddenPublicChatroom");
                            publicIcon.classList.remove("fa-angle-double-down");
                            publicIcon.classList.add("fa-angle-double-up");
                        } else {
                            publicChatroom.classList.add("hiddenPublicChatroom");
                            publicIcon.classList.remove("fa-angle-double-up");
                            publicIcon.classList.add("fa-angle-double-down");
                        }
                    });
                } else {
                    var privateChatrooms = document.querySelector(".privateChatroom");
                    var privateIcon = document.getElementById("publicIcon");
                    privateChatrooms.forEach(privateChatroom => {
                        if(privateChatroom.classList.contains("hiddenPrivateChatroom")) {
                            privateChatroom.classList.remove("hiddenPrivateChatroom");
                            privateIcon.classList.remove("fa-angle-double-down");
                            privateIcon.classList.add("fa-angle-double-up");
                        } else {
                            privateChatroom.classList.add("hiddenPrivateChatroom");
                            privateIcon.classList.remove("fa-angle-double-up");
                            privateIcon.classList.add("fa-angle-double-down");
                        }
                    });
                }
            },
            toggleSidebar() {
                var bars = document.getElementById("barsDiv");
                var toggleSidebar = document.getElementById("toggleSidebar");
                bars.classList.toggle("toggled");
                if(bars.classList.contains("toggled")) {
                    toggleSidebar.innerHTML = "<i class='fas fa-angle-double-right'></i>";
                } else {
                    toggleSidebar.innerHTML = "<i class='fas fa-angle-double-left'></i>";
                }
            }
        },
        computed: {
            invalidName() { return this.chatroom.name === ""; },
            invalidIcon() { return this.chatroom.icon === ""; }
        },
        created() {
            axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getChatrooms").then(response => {
                this.publicChatrooms = response.data.public;
                this.privateChatrooms = response.data.private;
            }).catch(error => console.log(error));
        }
    }
</script>

<style scoped>
    #chatroom {
        margin: 0 auto;
        max-width: 800px;
    }
    h1 {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    tbody .fas, tbody .far {
        cursor: pointer;
        margin-right: 5px;
    }
    .padded {
        padding-top: 20px;
    }
    td ul{
        list-style-type: none;
        padding-left: 0px;
    }
    .allowUser {
        margin-left: 5px;
        color: #008000;
    }
    .blockUser {
        margin-left: 5px;
        color: #ff0000;
    }
    .creationSuccessful {
        color: #008000;
        margin-bottom: 10px;
    }
    .errorField {
        border: 1px solid #ff0000;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
    }
    .errorInput {
        color: #ff0000;
    }
</style>