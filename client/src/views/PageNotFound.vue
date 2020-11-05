<template>
    <div id="overview" class="container-fluid">
        <div class="container pageNotFoundDiv">
            <div class="alert alert-danger" role="alert">This page does not exist!</div>
            <a href="#" class="btn btn-info" role="button" @click="login()">Proceed to login <i class="fas fa-hand-point-right"></i></a>
		</div>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "pageNotFound",
        methods: {
            login() {
                this.$router.push("/login");
            }
        }
    }
</script>

<style scoped>
    .pageNotFoundDiv {
        margin: 0 auto;
        max-width: 400px;
        text-align: center;
        margin-top: 20px;
    }
</style>