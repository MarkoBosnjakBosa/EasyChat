<template>
    <div id="adminOverview" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
            <div class="heading">EasyChat</div>
            <ul class="list list-group-flush">
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Channels</div><i class="fas fa-angle-double-down"></i></li>
                <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</li>
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i class="fas fa-angle-double-down"></i></li>
                <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light"><div class="chatroomIcon"><i :class="privateChatroom.icon"></i></div>{{privateChatroom.name}}</li>
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
                chatroomCreated: false
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