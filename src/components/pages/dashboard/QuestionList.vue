<script setup lang="ts">
import type { VTagColor } from '/@src/components/base/tags/VTag.vue'
import type { VAvatarProps } from '/@src/components/base/avatar/VAvatar.vue'
import { toFormValidator } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z as zod } from 'zod'
import { useNotyf } from '/@src/composable/useNotyf'
import { useQuestionStore } from '/@src/stores/questions'
import { useAuth0 } from '@auth0/auth0-vue'

// import * as listData from './data/view-list-v1'

export interface UserData extends VAvatarProps {
  name: string
  location: string
  role: string
  roleColor: VTagColor
  medias: {
    avatar: string
    flag: string
  }
  stats: {
    projects: number
    replies: number
    posts: number
  }
  teams: VAvatarProps[]
  questions: any[]
}

const props = withDefaults(
  defineProps<{
    questions: any
  }>(),
  {
    questions: [],
  }
)

const validationSchema = toFormValidator(
  zod.object({
    questionName: zod.string({
      required_error: 'Question Name is required!',
    }),
  })
)
const { user } = useAuth0()
const { copy } = useClipboard()
const questionStore = useQuestionStore()
const notyf = useNotyf()
const { handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: {
    questionName: '',
  },
})

const filters = ref('')
import { ref } from 'vue'

const isCreatingQuestion = ref(false)
const newQuestionModalOpen = ref(false)

const filteredData = computed(() => {
  if (!filters.value) {
    return props.questions
  } else {
    return props.questions.filter((item: any) => {
      return item.question.match(new RegExp(filters.value, 'i'))
    })
  }
})

const closeNewQuestionModal = () => {
  newQuestionModalOpen.value = false
  resetForm()
}

const onCreateQuestion = handleSubmit(async (values) => {
  console.log('handleCreateQuestion values')
  console.table(values)
  isCreatingQuestion.value = true
  const data = await questionStore.addNewQuestion({ ...values, userInfo: user.value })
  if (data) {
    notyf.success('Welcome, Erik Kovalsky')
    isCreatingQuestion.value = false
    newQuestionModalOpen.value = false
    questionStore.fetchQuestions()
    resetForm()
  }
})
</script>

<template>
  <div>
    <div class="list-view-toolbar">
      <VField>
        <VControl icon="feather:search">
          <input
            v-model="filters"
            class="input custom-text-filter"
            placeholder="Search..."
          />
        </VControl>
      </VField>

      <div class="list-info">
        <span v-if="filteredData.length === 1">1 record found</span>
        <span v-else>{{ filteredData.length }} records found</span>
      </div>

      <div class="buttons">
        <VButton
          color="primary"
          icon="fas fa-plus"
          elevated
          @click="newQuestionModalOpen = true"
        >
          New
        </VButton>
      </div>
    </div>

    <div class="page-content-inner">
      <!--List-->
      <div class="list-view list-view-v1">
        <!--List Empty Search Placeholder -->
        <VPlaceholderPage
          :class="[filteredData.length !== 0 && 'is-hidden']"
          title="We couldn't find any matching results."
          subtitle="Too bad. Looks like we couldn't find any matching results for the
          search terms you've entered. Please try different search terms or
          criteria."
          larger
        >
          <template #image>
            <img
              class="light-image"
              src="/@src/assets/illustrations/placeholders/search-1.svg"
              alt=""
            />
            <img
              class="dark-image"
              src="/@src/assets/illustrations/placeholders/search-1-dark.svg"
              alt=""
            />
          </template>
        </VPlaceholderPage>

        <div class="list-view-inner">
          <!--Item-->
          <TransitionGroup name="list-complete" tag="div">
            <div v-for="(item, key) in filteredData" :key="key" class="list-view-item">
              <div class="list-view-item-inner">
                <VAvatar
                  :picture="item?.medias?.avatar ?? ''"
                  size="large"
                  :badge="item?.medias?.flag ?? ''"
                />
                <div class="meta-left">
                  <h3>{{ item.question }}</h3>
                  <VButton
                    v-if="item.invitationCode"
                    rounded
                    :style="{ marginTop: '8px' }"
                    size="small"
                    @click="
                      copy('http://localhost:3000/invitation/' + item.invitationCode)
                    "
                  >
                    <i
                      :style="{ marginRight: '4px' }"
                      aria-hidden="true"
                      data-icon="feather:link"
                      class="iconify"
                    />
                    <span>Invitation Link</span>
                  </VButton>
                </div>
                <div class="meta-right">
                  <div class="tags">
                    <VTag label="Upcoming" color="primary" rounded elevated />
                  </div>

                  <div class="stats">
                    <div class="stat">
                      <span>5</span>
                      <span>Days Left</span>
                    </div>
                    <div class="separator"></div>
                    <div class="stat">
                      <span>{{ item.votes?.length ?? 0 }}</span>
                      <span>Votes</span>
                    </div>
                    <div class="separator"></div>
                    <div class="stat">
                      <span>{{ item.members?.length }}</span>
                      <span>Members</span>
                    </div>
                  </div>

                  <div class="network">
                    <VAvatarStack :avatars="item.members" :limit="3" size="small" />
                    <span>in Team</span>
                  </div>

                  <!--Dropdown-->
                  <QuestionListActionDropdown :item="item" />
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <VFlexPagination
        v-if="filteredData.length > 5"
        :item-per-page="10"
        :total-items="873"
        :current-page="42"
        :max-links-displayed="5"
      />
    </div>

    <VModal
      :open="newQuestionModalOpen"
      title="New Question"
      size="medium"
      actions="right"
      @close="closeNewQuestionModal"
    >
      <template #content>
        <form @submit="onCreateQuestion">
          <VField id="questionName" v-slot="{ field }">
            <VControl icon="feather:hash">
              <VInput
                type="text"
                placeholder="Raise your question to team up"
                autocomplete="name"
              />
              <p v-if="field?.errors?.value?.length" class="help is-danger">
                {{ field.errors?.value?.join(', ') }}
              </p>
            </VControl>
          </VField>
        </form>
      </template>
      <template #action>
        <VButton
          :loading="isCreatingQuestion"
          color="primary"
          raised
          @click.prevent="onCreateQuestion"
          >Create</VButton
        >
      </template>
    </VModal>
  </div>
</template>

<style lang="scss">
@import '/@src/scss/abstracts/all';

.list-view-v1 {
  .list-view-item {
    @include vuero-r-card;

    margin-bottom: 16px;
    padding: 16px;

    .list-view-item-inner {
      display: flex;
      align-items: center;

      .meta-left {
        margin-left: 16px;

        h3 {
          font-family: var(--font-alt);
          color: var(--dark-text);
          font-weight: 600;
          font-size: 1rem;
          line-height: 1;
        }

        > span:not(.tag) {
          font-size: 0.9rem;
          color: var(--light-text);

          svg {
            height: 12px;
            width: 12px;
          }
        }
      }

      .meta-right {
        margin-left: auto;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .tags {
          margin-right: 30px;
          margin-bottom: 0;

          .tag {
            margin-bottom: 0;
          }
        }

        .stats {
          display: flex;
          align-items: center;
          margin-right: 30px;

          .stat {
            display: flex;
            align-items: center;
            flex-direction: column;
            text-align: center;
            color: var(--light-text);

            > span {
              font-family: var(--font);

              &:first-child {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--dark-text);
                line-height: 1.4;
              }

              &:nth-child(2) {
                text-transform: uppercase;
                font-family: var(--font-alt);
                font-size: 0.75rem;
              }
            }

            svg {
              height: 16px;
              width: 16px;
            }

            i {
              font-size: 1.4rem;
            }
          }

          .separator {
            height: 25px;
            width: 2px;
            border-right: 1px solid var(--fade-grey-dark-3);
            margin: 0 16px;
          }
        }

        .network {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          min-width: 145px;

          > span {
            font-family: var(--font);
            font-size: 0.9rem;
            color: var(--light-text);
            margin-left: 6px;
          }
        }

        .dropdown {
          margin-left: 30px;
        }
      }
    }
  }
}

.is-dark {
  .list-view-v1 {
    .list-view-item {
      @include vuero-card--dark;

      .list-view-item-inner {
        .meta-left {
          h3 {
            color: var(--dark-dark-text) !important;
          }
        }

        .meta-right {
          .stats {
            .stat {
              span {
                &:first-child {
                  color: var(--dark-dark-text);
                }
              }
            }

            .separator {
              border-color: var(--dark-sidebar-light-16) !important;
            }
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .list-view-v1 {
    .list-view-item {
      .list-view-item-inner {
        position: relative;
        flex-direction: column;

        .v-avatar {
          margin-bottom: 10px;
        }

        .meta-left {
          text-align: center;
          margin-left: 0;
        }

        .meta-right {
          flex-direction: column;
          margin-left: 0;

          .tags {
            margin: 10px 0;
          }

          .stats {
            margin: 10px 0;
          }

          .network {
            margin: 10px 0 0;
            justify-content: center;

            > span {
              display: none;
            }
          }

          .dropdown {
            position: absolute;
            top: 0;
            right: 0;
            margin-left: 0;
          }
        }
      }
    }
  }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .list-view-v1 {
    display: flex;
    flex-wrap: wrap;

    .list-view-item {
      margin: 10px;
      width: calc(50% - 20px);

      .list-view-item-inner {
        position: relative;
        flex-direction: column;

        .v-avatar {
          margin-bottom: 10px;
        }

        .meta-left {
          margin-left: 0;
        }

        .meta-right {
          flex-direction: column;
          margin-left: 0;

          .tags {
            margin: 10px 0;
          }

          .stats {
            margin: 10px 0;
          }

          .network {
            margin: 10px 0 0;
            justify-content: center;

            > span {
              display: none;
            }
          }

          .dropdown {
            position: absolute;
            top: 0;
            right: 0;
            margin-left: 0;
          }
        }
      }
    }
  }
}
</style>
