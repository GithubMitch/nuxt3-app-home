<template>
  <div>
    <Suspense>
      <template #default>
        <div>{{ products }}</div>
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </div>
  <button @click="onClick">click</button>
</template>


<script>
// import { ref } from "vue";

export default {
  async setup() {
    const target = {
      message1: "hello",
      products: "default",
    };
    const handler1 = [];
    const proxy1 = new Proxy(target, handler1);
    proxy1.products = await useAsyncData("products", () => $fetch("/api/rq2"));

    console.log(proxy1.products.data._rawValue); // items
    let products = proxy1.products.data._rawValue;

    // console.log(products); // hello
    return { products };
  },
  methods: {
    async onClick() {
      let products = await useAsyncData("products", () => $fetch("/api/rq2"));
      console.log(products);
    },
  },
};
</script>

