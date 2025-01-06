<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <v-card-text class="pt-4">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="termData.title"
            label="약관 제목*"
            :rules="[(v) => !!v || '약관 제목은 필수입니다']"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="termData.type"
            :items="termTypes"
            item-title="title"
            item-value="key"
            label="약관 유형*"
            :rules="[(v) => !!v || '약관 유형은 필수입니다']"
            required
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-text-field v-model="termData.version" readonly></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3" class="d-flex align-center">
          <v-switch
            v-model="termData.isRequired"
            color="#FF5F2C"
            label="필수 여부"
            inset
          ></v-switch>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1 d-flex align-center">
              약관 내용*
              <v-spacer></v-spacer>
              <v-btn-toggle
                v-model="editorMode"
                color="#FF5F2C"
                rounded="lg"
                size="small"
              >
                <v-btn value="edit">
                  <v-icon>mdi-pencil</v-icon>
                  편집
                </v-btn>
                <v-btn value="html">
                  <v-icon>mdi-code-tags</v-icon>
                  HTML
                </v-btn>
                <!--                <v-btn v-if="termData.version > 1.0" value="diff">-->
                <!--                  <v-icon>mdi-compare</v-icon>-->
                <!--                  차이점-->
                <!--                </v-btn>-->
              </v-btn-toggle>
            </v-card-title>
            <v-card-text>
              <div v-if="editorMode === 'edit'">
                <div ref="editorContainer" class="editor-container">
                  <QuillEditor
                    :content="termData.content"
                    @update:content="updateContent"
                    contentType="html"
                    :options="editorOptions"
                    :toolbar="toolbarOptions"
                    @textChange="onEditorTextChange"
                    theme="snow"
                  />
                </div>
              </div>

              <div v-else-if="editorMode === 'html'" class="html-preview pa-4">
                <pre><code>{{ sanitizedContent }}</code></pre>
              </div>

              <div v-else-if="editorMode === 'diff'" class="diff-preview pa-4">
                <terms-diff-view
                  v-if="previousVersion"
                  :previous-terms="previousVersion"
                  :current-terms="termData"
                  :loading="diffLoading"
                />
                <v-alert
                  v-else
                  type="info"
                  text="이전 버전을 불러오지 못했어요."
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="termData.revisionNote"
            label="개정 사유"
            rows="3"
            placeholder="약관이 변경된 이유나 주요 변경사항을 입력하세요"
            no-resize
          ></v-textarea>
        </v-col>
      </v-row>

      <v-row v-if="termType">
        <v-col cols="12">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title>변경 이력</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-timeline density="compact" align="start">
                  <v-timeline-item
                    v-for="history in versionHistory"
                    :key="history.version"
                    :dot-color="
                      history.version === termData.version ? '#FF5F2C' : 'grey'
                    "
                    size="small"
                  >
                    <v-card class="elevation-1">
                      <v-card-title class="text-subtitle-1">
                        버전 {{ history.version }} ({{
                          formatStringDate(history.createdAt)
                        }})
                      </v-card-title>
                      <v-card-text>
                        개정 사유: {{ history.revisionNote }}
                      </v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" class="mx-2" width="120" @click="$emit('back')">
        취소
      </v-btn>
      <v-btn
        color="#FF5F2C"
        width="120"
        :loading="loading"
        :disabled="!isValid"
        @click="handleSubmit"
        dark
      >
        저장
      </v-btn>
    </v-card-actions>
  </v-form>
  <v-snackbar v-model="show" :color="color" :timeout="3000">
    {{ message }}
    <template v-slot:action="{ attrs }">
      <v-btn text="" v-bind="attrs" @click="show = false">닫기</v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { formatStringDate } from "@/utils/date-formatter";
import TermsDiffView from "@/components/terms/TermsDiffView.vue";
import { request } from "@/utils/request-client";
import { BaseResponse } from "@/types/common/response";
import { TermsResponse, TermsRevisionResponse } from "@/types/terms";
import { VForm } from "vuetify/components";
import DOMPurify from "dompurify";
import { useSnackbar } from "@/hook/snackbar";

export default defineComponent({
  name: "TermDetailView",
  methods: { formatStringDate },
  components: {
    QuillEditor,
    TermsDiffView,
  },
  props: {
    termType: {
      type: String as () => string | null,
      required: true,
    },
  },
  emits: ["save-success", "back"],
  setup(props, { emit }) {
    const form = ref<InstanceType<typeof VForm>>(
      {} as InstanceType<typeof VForm>
    );
    const isValid = ref(false);
    const loading = ref(false);
    const editorMode = ref("edit");
    const diffLoading = ref(false);
    const previousTerms = ref<TermsResponse | null>(null);
    const termData = ref<TermsResponse>({
      id: 0,
      title: "",
      type: "",
      version: 1.0,
      content: "",
      revisionNote: "",
      isRequired: false,
      createdAt: "",
    });
    const revisionHistory = ref<TermsRevisionResponse[]>([]);
    const { show, message, color, showMessage } = useSnackbar();

    onMounted(() => {
      if (props.termType) {
        fetchTermDetail();
        fetchTermRevisionHistory();
      }
    });

    watch(editorMode, async (newMode) => {
      if (
        newMode === "diff" &&
        !previousTerms.value &&
        termData.value.version > 1.0
      ) {
        await fetchPreviousVersion();
      }
    });

    // 약관 유형 목록
    const termTypes = [
      { title: "만 14세 이상", key: "OVER_14_POLICY" },
      { title: "서비스 이용약관", key: "TERMS_OF_SERVICE" },
      { title: "개인정보 처리방침", key: "PRIVACY_POLICY" },
      { title: "위치기반 서비스 이용약관", key: "LOCATION_POLICY" },
      { title: "마케팅 정보 수신 동의", key: "MARKETING_POLICY" },
      {
        title: "카카오톡 마케팅 정보 수신 동의",
        key: "KAKAO_MARKETING_POLICY",
      },
    ];

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      ["clean"],
      [{ align: [] }],
      ["link"],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote"],
    ];

    const editorOptions = {
      placeholder: "약관 내용을 입력하세요.",
      readOnly: false,
      modules: {
        toolbar: toolbarOptions,
        history: {
          delay: 2000,
          maxStack: 500,
          userOnly: true,
        },
      },
    };

    const sanitizedContent = computed(() => {
      return termData.value.content
        ? DOMPurify.sanitize(termData.value.content)
        : "";
    });

    const updateContent = (newContent: string) => {
      termData.value.content = newContent;
    };

    const onEditorTextChange = () => {
      if (form.value) {
        form.value.validate();
      }
    };

    const fetchTermDetail = async () => {
      if (!props.termType) return;

      loading.value = true;
      try {
        termData.value = (
          await request<BaseResponse<TermsResponse>>(
            `/v1/terms/${props.termType}`
          )
        ).data;
      } catch (e) {
        showMessage("약관 상세 정보를 불러오지 못했어요.");
      } finally {
        loading.value = false;
      }
    };

    const fetchTermRevisionHistory = async () => {
      if (!props.termType) return;

      try {
        revisionHistory.value = (
          await request<BaseResponse<TermsRevisionResponse[]>>(
            `/v1/terms/${props.termType}/revisions`
          )
        ).data;
      } catch (e) {
        showMessage("약관 변경 이력을 불러오지 못했어요.");
      }
    };

    const fetchPreviousVersion = async () => {
      if (!props.termType) return;

      diffLoading.value = true;
      try {
        previousTerms.value = (
          await request<BaseResponse<TermsResponse>>(
            `/v1/terms/${props.termType}/revisions/${termData.value.version}`
          )
        ).data;
      } catch (e) {
        showMessage("이전 버전 정보를 불러오지 못했어요.");
      } finally {
        diffLoading.value = false;
      }
    };

    const handleSubmit = async () => {
      if (!form.value.validate()) return;
      if (!termData.value.revisionNote) {
        showMessage("개정 사유를 입력해주세요.");
        return;
      }

      loading.value = true;
      try {
        request<never>("/v1/terms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            type: props.termType,
            isRequired: termData.value.isRequired,
            title: termData.value.title,
            content: termData.value.content,
            revisionNote: termData.value.revisionNote,
          }),
        }).then(() => {
          emit("save-success");
        });
      } catch (e) {
        showMessage("약관 저장에 실패했어요.");
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      isValid,
      loading,
      editorMode,
      termData,
      termTypes,
      versionHistory: revisionHistory,
      editorOptions,
      toolbarOptions,
      sanitizedContent,
      updateContent,
      onEditorTextChange,
      handleSubmit,
      diffLoading,
      previousVersion: previousTerms,
      show,
      message,
      color,
      showMessage,
    };
  },
});
</script>

<style scoped>
.editor-container {
  height: 500px;
  margin-bottom: 20px;
}

:deep(.ql-container) {
  height: calc(100% - 42px);
  font-size: 14px;
  font-family: inherit;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.ql-toolbar.ql-snow) {
  border: 1px solid #ddd;
}

:deep(.ql-container.ql-snow) {
  border: 1px solid #ddd;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.html-preview {
  background-color: #1e1e1e;
  border-radius: 4px;
  color: #d4d4d4;
  font-family: "Consolas", "Monaco", monospace;
  overflow-x: auto;
}

.html-preview pre {
  margin: 0;
  padding: 16px;
}

.html-preview code {
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-preview {
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.ql-snow .ql-stroke) {
  stroke: #666;
}

:deep(.ql-snow .ql-fill) {
  fill: #666;
}

:deep(.ql-snow.ql-toolbar button:hover .ql-stroke) {
  stroke: #ff5f2c;
}

:deep(.ql-snow.ql-toolbar button:hover .ql-fill) {
  fill: #ff5f2c;
}

:deep(.ql-snow.ql-toolbar button.ql-active .ql-stroke) {
  stroke: #ff5f2c;
}

:deep(.ql-snow.ql-toolbar button.ql-active .ql-fill) {
  fill: #ff5f2c;
}

.v-timeline-item.active .v-timeline-divider__dot {
  background-color: #ff5f2c !important;
}
</style>
