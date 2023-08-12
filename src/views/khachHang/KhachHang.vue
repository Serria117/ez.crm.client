<script setup>
/* eslint-disable */
import { ref, onMounted, onBeforeMount } from "vue";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import axios from "axios";
import Paginator from "primevue/paginator";
import { FilterMatchMode } from "primevue/api";
import env from "@/config/variable";
import ProgressSpinner from "primevue/progressspinner";
import commonFunc from "@/common/commonFunc";

const toast = useToast();
const isLoading = ref(true);
const customerList = ref([]);
const selectedCustomers = ref([]);
const customer = ref({
  taxCode: null,
  fullName: null,
  shortName: null,
  email: null,
  phone: null,
  address: null,
  taxAccount: null,
  taxAccountPassword: null,
  tokenPin: null,
  invoiceProvider: null,
  invoiceAccount: null,
  invoiceAccountPassword: null,
  createdAt: null,
  description: null
});

const customerDialog = ref(false);
const customerDialogTitle = ref(null);
const isUpdate = ref(false);
const isFormValid = ref(true);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }

});

const page = ref(1);
const size = ref(10);
const totalPage = ref();
const totalItems = ref(0);
const rowsPerPage = ref([5, 10, 20, 50]);
const searchKeyword = ref(null);

onMounted(() => {
  getAllCustomer();

});
const confirmDeleteSelected = () => {
};
const exportCSV = () => {
};
const openNew = () => {
  resetForm();
  customerDialogTitle.value = "Thêm mới khách hàng";
  customerDialog.value = true;
  isUpdate.value = false;
};

const checkDuplicate = (taxCode) => {
  let url = `${env.BASE_URL}${env.CUSTOMER_API.checkTaxCode}?taxCode=${taxCode}`;
  axios.post(url)
    .then(res => {
      if (res.data.code === "9000") {
        isFormValid.value = false;
        toast.add({
          severity: "warn",
          summary: "Cảnh báo",
          detail: `Mã số thuế ${taxCode} đã tồn tại`,
          life: 5000
        });
      }
      getInfo();
    });
};

const getInfo = () => {
  let url = `https://api.vietqr.io/v2/business/${customer.value.taxCode}`;
  axios.get(url)
    .then(res => {
      if (res.data.code === "00") {
        customer.value.fullName = res.data.data.name;
        customer.value.address = res.data.data.address;
        customer.value.taxAccount = `${customer.value.taxCode}-QL`;
      }
    });
};

const resetForm = () => {
  Object.keys(customer.value).forEach((i) => customer.value[i] = null);
};

const setNull = () => {
  Object.keys(customer.value).forEach((i) => {
    if (customer.value[i] === "") {
      customer.value[i] = null;
    }
  });
};

const createCustomer = (savedCustomer) => {
  let url = env.BASE_URL + env.CUSTOMER_API.create;
  axios.post(url, savedCustomer)
    .then(res => {
      console.log(res);
      if (res.data.code === "1000" || res.data.code === "2000") {
        toast.add({
          severity: "success",
          summary: "Thành công",
          detail: `Đã thêm mới khách hàng: ${savedCustomer.fullName} - ${savedCustomer.taxCode}`,
          life: 5000
        });
        customerDialog.value = false;
        resetForm();
        getAllCustomer();
      } else {
        toast.add({
          severity: "warn",
          summary: "Cảnh báo",
          detail: res.data.message,
          life: 5000
        });
      }
    })
    .catch(err => {
      toast.add({
        severity: "error",
        summary: "Lỗi hệ thống",
        detail: err,
        life: 5000
      });
    });
};

const updateCustomer = (updatedCustomer) => {
  let url = env.BASE_URL + env.CUSTOMER_API.update;
  axios.post(url, updatedCustomer)
    .then(res => {
      if (res.status === 200) {
        toast.add({
          severity: "success",
          summary: "Thành công",
          detail: "Cập nhật thành công!",
          life: 5000
        });
        customerDialog.value = false;
        resetForm();
        getAllCustomer();
      } else {
        toast.add({
          severity: "warn",
          summary: "Cảnh báo",
          detail: "Cập nhật không thành công!",
          life: 5000
        });
      }
    })
    .catch(err => {
      toast.add({
        severity: "error",
        summary: "Lỗi hệ thống",
        detail: err,
        life: 5000
      });
    });
};
const getAllCustomer = () => {
  let url = env.BASE_URL + env.CUSTOMER_API.getAll;
  axios.get(url, {
    params: {
      page: page.value,
      size: size.value
    }
  })
    .then(res => {
      if (res.data.items) {
        isLoading.value = false;
        customerList.value = res.data.items;
        totalItems.value = res.data.total;
      } else toast.add({
        severity: "info",
        summary: "Thông báo",
        detail: "Không có danh sách khách hàng",
        life: 5000
      });
    })
    .catch(err => console.log(err));
};

const searchCustomer = (keyword) => {
  let url = env.BASE_URL + env.CUSTOMER_API.search;
  axios.get(url, {
    params: {
      keyword: keyword,
      page: page.value,
      size: size.value
    }
  }).then(res => {
    customerList.value = res.data.items;
    totalItems.value = res.data.total;
  });
};

const handleSearch = () => {
  if (searchKeyword.value !== null && searchKeyword.value.length >= 3) {
    searchCustomer(searchKeyword.value);
  } else {
    getAllCustomer();
  }
};

const save = () => {
  if (isFormValid.value) {
    setNull();
    commonFunc.trimObject(customer.value);
    let savedCustomer = { ...customer.value };
    if (!isUpdate.value) {
      createCustomer(savedCustomer);
    } else {
      updateCustomer(savedCustomer);
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Thông tin chưa hợp lệ",
      detail: "Vui lòng kiểm tra lại thông tin.",
      life: 5000
    });
  }
};

const edit = (editCustomer) => {
  customerDialogTitle.value = "Cập nhật thông tin khách hàng";
  customer.value = { ...editCustomer };
  isUpdate.value = true;
  customerDialog.value = true;
};

const changePage = (event) => {
  page.value = event.page + 1;
  size.value = event.rows;
  if (searchKeyword.value !== null && searchKeyword.value.length >= 3) {
    searchCustomer(searchKeyword.value);
  } else {
    getAllCustomer();
  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast position="bottom-right" />
        <Toolbar class="mb-4">
          <template v-slot:start>
            <div class="my-2">
              <Button label="Thêm mới" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
            </div>
          </template>

          <template v-slot:end>
            <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                        class="mr-2 inline-block" />
            <Button label="Export" icon="pi pi-download" class="p-button-help" @click="exportCSV($event)" />
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="customerList"
          v-model:selection="selectedCustomers"
          dataKey="taxCode"
          :paginator="false"
          :rows="size"
          responsiveLayout="scroll"
        >
          <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
              <h5 class="m-0">Quản trị khách hàng</h5>
              <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText placeholder="Tìm theo MST hoặc tên..." v-model="searchKeyword"
                                           @keyup="handleSearch" />
                            </span>
            </div>
          </template>
          <!--          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>-->
          <Column headerStyle="min-width:7rem;" header="Thao tác">
            <template #body="slotProps">
              <Button icon="pi pi-pencil" class="p-button-icon-only p-button-info mr-2" v-tooltip.top="'Xem thông tin'"
                      @click="edit(slotProps.data)" />
            </template>
          </Column>
          <Column field="taxCode" header="Mã số thuế" :sortable="true" filter-field="taxCode"
                  headerStyle="width:14%; min-width:10rem;"></Column>
          <Column field="fullName" header="Tên doanh nghiệp" :sortable="true" filter-field="fullName"
                  headerStyle="width:14%; min-width:20rem;">
            <template #body="slotProps">
              <span class="p-column-title">Tên doanh nghiệp</span>
              {{ slotProps.data.fullName }}
            </template>
          </Column>
          <Column field="shortName" header="Tên viết tắt" :sortable="true" headerStyle="width:14%; min-width:20rem;">
            <template #body="slotProps">
              <span class="p-column-title">Tên viết tắt</span>
              {{ slotProps.data.shortName }}
            </template>
          </Column>
          <Column field="email" header="Email" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Email</span>
              {{ slotProps.data.email }}
            </template>
          </Column>
          <Column field="phone" header="Ngày tạo" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Ngày tạo</span>
              {{ new Date(slotProps.data.createdAt).toLocaleDateString("En-GB") }}
            </template>
          </Column>
        </DataTable>
        <div v-if="isLoading" class="flex justify-content-center">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="3"
                           animationDuration="1s" aria-label="Custom ProgressSpinner" />
        </div>
        <div>
          <Paginator
            :rows="size"
            :page-link-size="5"
            :totalRecords="totalItems"
            :rowsPerPageOptions="rowsPerPage"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            @page="changePage"
            currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} bản ghi" />
        </div>

        <Dialog v-model:visible="customerDialog"
                :style="{ width: '1200px' }"
                :header="customerDialogTitle"
                :modal="true" class="p-fluid"
                maximizable
        >
          <div class="card p-fluid">
            <div class="formgrid grid">
              <div class="field col">
                <label for="mst">Mã số thuế</label>
                <InputText id="mst" type="text" :disabled="isUpdate" v-model="customer.taxCode"
                           @blur="checkDuplicate(customer.taxCode)" />
              </div>
              <div class="field col">
                <label for="fullName">Tên doanh nghiệp</label>
                <InputText id="fullName" type="text" v-model="customer.fullName" />
              </div>
              <div class="field col">
                <label for="shortName">Tên viết tắt</label>
                <InputText id="shortName" type="text" v-model="customer.shortName" />
              </div>
            </div>
            <div class="formgrid grid">
              <div class="field col-6">
                <label for="address">Địa chỉ</label>
                <InputText id="address" type="text" v-model="customer.address" />
              </div>
              <div class="field col-2">
                <label for="phone">Điện thoại</label>
                <InputText id="phone" type="phone" v-model="customer.phone" />
              </div>
              <div class="field col-4">
                <label for="email">Email</label>
                <InputText id="email" type="email" v-model="customer.email" />
              </div>
            </div>
            <div class="formgrid grid">
              <div class="field col-6">
                <label for="iTaxAccount">Tài khoản iTax</label>
                <InputText id="iTaxAccount" type="text" v-model="customer.taxAccount" />
              </div>
              <div class="field col-3">
                <label for="iTaxAccountPass">Mật khẩu iTax</label>
                <InputText id="iTaxAccountPass" type="text" v-model="customer.taxAccountPassword" />
              </div>
              <div class="field col-3">
                <label for="token">Token PIN</label>
                <InputText id="token" type="text" v-model="customer.tokenPin" />
              </div>
            </div>
            <div class="formgrid grid">
              <div class="field col-6">
                <label for="invoiceProvider">Nhà cung cấp đơn điện tử</label>
                <InputText id="invoiceProvider" type="text" v-model="customer.invoiceProvider" />
              </div>
              <div class="field col-3">
                <label for="invoiceAccount">Tài khoản Hóa đơn</label>
                <InputText id="invoiceAccount" type="text" v-model="customer.invoiceAccount" />
              </div>
              <div class="field col-3">
                <label for="invoiceAccountPass">Mật khẩu tài khoản hóa đơn</label>
                <InputText id="invoiceAccountPass" type="text" v-model="customer.invoiceAccountPassword" />
              </div>
            </div>
            <div class="formgrid grid">
              <div class="field col-12">
                <label for="description">Thông tin bổ sung</label>
                <Textarea id="description" rows="3" v-model="customer.description"></Textarea>
              </div>
            </div>
          </div>
          <template #footer>
            <Button v-if="!isUpdate" label="Nhập lại" class="p-button-warning" icon="pi pi-trash" @click="resetForm" />
            <Button label="Lưu thông tin" icon="pi pi-save" @click="save" autofocus />
          </template>
        </Dialog>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
