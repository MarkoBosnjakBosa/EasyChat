<template>
    <div id="forgotCredentials" class="container-fluid">
        <form autocomplete="off" @submit.prevent="sendEmail()">
            <h1>Forgot credentials</h1>
            <fieldset class="form-group">
                <div class="row">
                    <legend class="col-form-label col-sm-2 pt-0">Forgot:</legend>
                    <div class="col-sm-10">
                        <div class="form-check">
                            <input type="radio" name="option" id="password" class="form-check-input" value="password" v-model="option" checked/>
                            <label for="password" class="form-check-label">Password</label>
                        </div>
                        <div class="form-check">
                            <input type="radio" name="option" id="username" class="form-check-input" value="username" v-model="option"/>
                            <label for="username" class="form-check-label">Username</label>
                        </div>
                        <div class="form-check">
                            <input type="radio" name="option" id="confirmation" class="form-check-input" value="confirmation" v-model="option"/>
                            <label for="confirmation" class="form-check-label">Confirmation email</label>
                        </div>
                    </div>
                </div>
            </fieldset>
            <div class="form-group emailDiv">
                <input type="text" id="email" class="form-control" placeholder="Email" v-model="email" @focus="clearEmailStatus()" @keypress="clearEmailStatus()"/>
                <small v-if="emailError" class="form-text errorInput">Please provide a valid email!</small>
            </div>
            <div v-if="emailSent" class="form-group emailSentSuccessful">Please visit your inbox and follow suggested steps!</div>
            <div class="form-group submitDiv">
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
            <div class="form-group loginDiv">
                <button type="button" class="btn btn-info" @click="login()">Proceed to login <i class="fas fa-hand-point-right"></i></button>
            </div>
        </form>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
	var axios = require("axios");
	
    export default {
        name: "forgotCredentials",
        data() {
            return {
                emailError: false,
                option: "password",
                email: "",
                emailSent: false
            }
        },
        methods: {
            sendEmail() {
                this.clearEmailStatus();
                if(this.invalidEmail) {
                    this.emailError = true;
                    this.emailSent = false;
                    return;
                }
                var body = {option: this.option, email: this.email};
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/forgotCredentials", body).then(response => {
                    if(response.data.sent) {
                        this.emailSent = true;
                        this.option = "password";
                        this.email = "";
                        this.emailError = false;
                    } else {
                        this.emailError = true;
                        this.emailSent = false;
                    }
                }).catch(error => console.log(error));
            },
            login() {
                this.$router.push("/login");
            },
            clearEmailStatus() { 
                this.emailError = false;
                this.emailSent = false; 
            }
        },
        computed: {
            invalidEmail() {
                var emailFormat = /\S+@\S+\.\S+/;
                if(this.email != "" && emailFormat.test(this.email)) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }
</script>

<style scoped>
    #forgotCredentials {
        margin: 0 auto;
        max-width: 400px;
    }
    h1 {
		text-align: center;
		margin-top: 20px;
		margin-bottom: 20px;
	}
    .emailDiv, .submitDiv, .loginDiv {
        text-align: center;
    }
    .emailSentSuccessful {
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