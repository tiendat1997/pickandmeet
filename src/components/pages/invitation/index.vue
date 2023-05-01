<script setup lang="ts">
import { useNotyf } from '/@src/composable/useNotyf'
import { useInvitationStore } from '/@src/stores/invitations'

const props = withDefaults(
  defineProps<{
    invitationInfo: any
  }>(),
  {
    invitationInfo: null,
  }
)

const isLoading = ref(false)
const hostInfoRef: any = ref({})
const membersInfoRef = ref([])

const notyf = useNotyf()
const router = useRouter()
const invitationStore = useInvitationStore()

const accept = async () => {
  isLoading.value = true

  const invitationCode = props.invitationInfo.invitationCode
  const createdBy = props.invitationInfo.createdBy
  const data = await invitationStore.acceptInvitation({
    invitationCode: invitationCode,
    hostId: createdBy,
  })

  if (data && data._id) {
    notyf.success('Invitation accepted')
    const navigatedUrl = '/map/' + data.rangeKey
    router.push(navigatedUrl)
  } else {
    notyf.error('Invitation accepted - FAILED')
  }
  isLoading.value = false
}

onMounted(() => {
  console.log('Component::Invitation -> onMounted -> ', props.invitationInfo)
  hostInfoRef.value = props.invitationInfo?.host?.userInfo ?? {}
  membersInfoRef.value = props.invitationInfo?.members?.map((member: any) => ({
    picture: member.userInfo?.picture ?? '',
  }))
})
</script>

<template>
  <div class="action-page-wrapper action-page-v1">
    <div class="wrapper-inner">
      <div v-if="props.invitationInfo" class="action-box">
        <div class="box-content">
          <VAvatar size="big" :picture="hostInfoRef.picture" />

          <h3 class="dark-inverted">
            <span>{{ hostInfoRef.given_name }}</span> has invited you to the
            <span class="is-dark-primary">{{ props.invitationInfo.question }}</span>
          </h3>

          <div class="sender-message is-dark-card-bordered is-dark-bg-4">
            <h4 class="dark-inverted">Message from {{ hostInfoRef.given_name }}</h4>
            <p>
              Hey Erik, It would be really cool if you could give us a hand on this
              project. There are a lot of tasks popping out every day and I feel the team
              is getting a bit overwhelmed. We'd love to have you board.
            </p>
          </div>
          <div v-if="membersInfoRef.length > 1" class="people-wrap">
            <div class="people">
              <VAvatarStack :avatars="membersInfoRef" :limit="3" size="medium" />
            </div>
            <div class="people-text">
              <p>are already members of the team</p>
            </div>
          </div>
          <div class="buttons">
            <VButton dark-outlined> Decline </VButton>
            <VButton
              color="primary"
              :loading="isLoading"
              raised
              tabindex="0"
              @keydown.space.prevent="accept"
              @click="accept"
            >
              Join
            </VButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '/@src/scss/abstracts/all';

.action-page-wrapper {
  &.action-page-v1 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 540px;
    min-height: 560px;
    margin: 0 auto;

    .wrapper-inner {
      .action-box {
        @include vuero-s-card;

        padding: 40px;

        .box-content {
          text-align: center;
          font-family: var(--font);

          .v-avatar {
            display: block;
            margin: 0 auto 8px;
          }

          h3 {
            font-family: var(--font-alt);
            font-weight: 600;
            max-width: 320px;
            margin: 0 auto 16px;

            span {
              color: var(--primary);
            }
          }

          .sender-message {
            text-align: left;
            padding: 20px;
            border: 1px solid var(--fade-grey-dark-3);
            max-width: 360px;
            margin: 0 auto;
            border-radius: var(--radius-large);
            box-shadow: var(--light-box-shadow);

            h4 {
              font-family: var(--font-alt);
              font-size: 0.7rem;
              font-weight: 500;
              color: var(--dark-text);
              text-transform: uppercase;
              margin-bottom: 6px;
            }

            p {
              font-size: 0.9rem;
            }
          }

          .people-wrap {
            .people {
              display: flex;
              justify-content: center;
              padding: 16px 0 8px;

              .v-avatar {
                margin: 0 4px;
              }
            }

            .people-text {
              p {
                font-size: 0.9rem;
              }
            }
          }

          .buttons {
            margin: 0 auto;
            display: flex;
            justify-content: center;
            padding-top: 30px;

            .button {
              margin: 0 4px;
              min-width: 150px;
            }
          }
        }
      }
    }
  }
}

.is-dark {
  .action-page-wrapper {
    &.action-page-v1 {
      .wrapper-inner {
        .action-box {
          @include vuero-card--dark;
        }
      }

      .wrapper-outer {
        @include vuero-card--dark;
      }
    }
  }
}

/* ==========================================================================
3. Media Queries
========================================================================== */

@media only screen and (max-width: 767px) {
  .action-page-wrapper {
    &.action-page-v1 {
      .wrapper-inner {
        .action-box {
          padding: 20px;

          .box-content {
            .buttons {
              .button {
                min-width: 130px;
              }
            }
          }
        }
      }
    }
  }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .action-page-wrapper {
    &.action-page-v1 {
      .wrapper-inner {
        .action-box {
          .box-content {
            .buttons {
              .button {
                min-width: 130px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
