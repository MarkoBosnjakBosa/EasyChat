<template>
  <div id="login" class="container-fluid">
    <form autocomplete="off" @submit.prevent="loginUser">
      <h1>Login</h1>
      <div class="form-group">
        <input type="text" id="login" class="form-control" :class="{'errorField' : loginError}" placeholder="Username or email" v-model="user.login" ref="first" @keyup="checkLogin" @change="checkLogin" @input="checkLogin">
        <small v-if="loginError" class="form-text errorInput">Please provide a valid username or email!</small>
      </div>
      <div class="form-group">
        <div class="input-group">
          <input type="password" id="password" class="form-control" :class="{'errorField' : passwordError && submitting}" placeholder="Password" v-model="user.password" @focus="clearPasswordStatus" @keypress="clearPasswordStatus">
          <div class="input-group-append">
            <button type="button" class="btn btn-light" :class="{'errorIcon' : passwordError && submitting}" @click="togglePassword"><i id="togglePassword" class="fa fa-eye"></i></button>
          </div>
        </div>
        <small v-if="passwordError && submitting" class="form-text errorInput">Please provide a valid password!</small>
      </div>
      <div class="form-group forgotPasswordDiv">
        <a href="#" @click.prevent="resetPassword">Forgot password?</a>
      </div>
      <div v-if="passwordMatch" class="loginFailed">Password does not match!</div>
      <div class="form-group submitDiv">
        <button type="submit" class="btn btn-primary submitButton">Log in</button>
      </div>
      <div class="form-group registerDiv">
        Not a member? <a href="#" @click.prevent="register">Register</a>
      </div>
    </form>
  </div>
</template>

<script>
  import "bootstrap";
  import "bootstrap/dist/css/bootstrap.min.css";
  var axios = require("axios");

  export default {
    name: "login",
    data() {
      return {
        submitting: false,
        loginError: false,
        passwordError: false,
        user: {
          login: "",
          password: ""
        },
        passwordMatch: false
      }
    },
    methods: {
      resetPassword() {
        this.$router.push({name: "ResetPassword"});
      },
      register() {
        this.$router.push({name: "Registration"});
      },
      checkLogin() {
        axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/checkLogin", {
          login: this.user.login.toLowerCase()
        }).then(response => {
          if(response.data.exists) {
            this.loginError = false;
          } else {
            if(response.data.empty) {
              this.loginError = false;
            } else {
              this.loginError = true;
            }
          }
        }).catch(error => console.log(error));
      },
      loginUser() {
        this.submitting = true;
        this.clearLoginStatus();
        this.clearPasswordStatus();
        var allowSubmit = true;
        if(this.invalidLogin) {
          this.loginError = true;
          allowSubmit = false;
        }
        if(this.invalidPassword) {
          this.passwordError = true;
          allowSubmit = false;
        }
        if(!allowSubmit) {
          this.passwordMatch = false;
          return;
        }
        axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/login", {
          login: this.user.login.toLowerCase(),
          password: this.user.password
        }).then(response => {
          if(response.data.valid) {
            this.user = { login: "", password: ""};
            this.loginError = false, this.passwordError = false, this.passwordMatch = false, this.submitting = false;
            /*if(response.data.admin) {
              this.$router.push({name: "AdminProfile"});
            } else {
              this.$router.push({name: "Profile"});
            }*/
          } else {
            if(response.data.allowed) {
              this.passwordMatch = true;
            } else {
              var errorFields = response.data.errorFields;
              if(errorFields.includes("login")) this.loginError = true;
              if(errorFields.includes("password")) this.passwordError = true;
              this.passwordMatch = false;
            }
          }
        }).catch(error => console.log(error));
      },
      clearLoginStatus() { this.loginError = false; },
      clearPasswordStatus() { this.passwordError = false; },
      togglePassword() {
        var type = document.getElementById("password").getAttribute("type");
        switch(type) {
          case "password": {
            document.getElementById("password").setAttribute("type", "text");
            document.getElementById("togglePassword").classList.remove("fa-eye");
            document.getElementById("togglePassword").classList.add("fa-eye-slash");
            return;
          }
          case "text": {
            document.getElementById("password").setAttribute("type", "password");
            document.getElementById("togglePassword").classList.remove("fa-eye-slash");
            document.getElementById("togglePassword").classList.add("fa-eye");
            return;
          }
        }
      }
    },
    computed: {
      invalidLogin() { return this.user.login === ""; },
      invalidPassword() {
        var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if(this.user.password != "" && passwordFormat.test(this.user.password)) {
          return false;
        } else {
          return true;
        }
      }
    }
  }
</script>

<style scoped>
  #login {
    margin: 0 auto;
    max-width: 300px;
  }
  h1 {
    text-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .forgotPasswordDiv {
    text-align: right;
  }
  .submitButton {
    width: 100%;
  }
  .submitDiv, .registerDiv {
    text-align: center;
  }
  .loginFailed {
    color: #ff0000;
    margin-bottom: 10px;
  }
  .errorField {
    border: 1px solid #ff0000;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
  }
  .errorIcon {
    border: 1px solid #ff0000;
    border-left: 0px;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
  }
  .errorInput {
    color: #ff0000;
  }
</style>
