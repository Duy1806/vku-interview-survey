import './style.css'

// ==========================================
// GOOGLE APPS SCRIPT API
// ==========================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbyGEe5-EXSm2QilztXZFnI7Xe32i-jwPB5dOdok7jaThaHIS0r_5dSItIE_DMgMxdm-/exec'


// ==========================================
// INDEXEDDB
// ==========================================

const DB_NAME = 'vkuInterviewDB'

const STORE_NAME = 'surveys'

const DB_VERSION = 2


const app = document.querySelector('#app')


// Dữ liệu tạm của form
let surveyData = {}

async function getStatistics() {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(
        result.message || 'Không thể lấy thống kê'
      )
    }

    return result.statistics

  } catch (error) {
    console.error(
      'Lỗi lấy thống kê:',
      error
    )

    return {
      total: 0,
      interviewed: 0,
      notInterviewed: 0,
      lookingForJob: 0
    }
  }
}


// ==========================================
// MỞ DATABASE
// ==========================================

function openDatabase() {

  return new Promise((resolve, reject) => {

    const request =
      indexedDB.open(
        DB_NAME,
        DB_VERSION
      )


    request.onupgradeneeded = () => {

      const db = request.result


      // Database cũ có thể đã có store "sessions"

      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {

        db.createObjectStore(
          STORE_NAME,
          {
            keyPath: 'id'
          }
        )
      }
    }


    request.onsuccess = () => {

      resolve(
        request.result
      )
    }


    request.onerror = () => {

      reject(
        request.error
      )
    }
  })
}


// ==========================================
// LƯU KHẢO SÁT
// ==========================================

async function saveSurvey(data) {

  const db =
    await openDatabase()


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          STORE_NAME,
          'readwrite'
        )


      const store =
        transaction.objectStore(
          STORE_NAME
        )


      const request =
        store.put(data)


      request.onsuccess = () => {

        resolve()
      }


      request.onerror = () => {

        reject(
          request.error
        )
      }
    }
  )
}


// ==========================================
// LẤY TẤT CẢ KHẢO SÁT
// ==========================================

async function getAllSurveys() {

  const db =
    await openDatabase()


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          STORE_NAME,
          'readonly'
        )


      const store =
        transaction.objectStore(
          STORE_NAME
        )


      const request =
        store.getAll()


      request.onsuccess = () => {

        resolve(
          request.result || []
        )
      }


      request.onerror = () => {

        reject(
          request.error
        )
      }
    }
  )
}


// ==========================================
// NETWORK STATUS
// ==========================================

function getNetworkStatusHTML() {

  if (navigator.onLine) {

    return `
      <span class="network-status online">
        ● Online
      </span>
    `
  }


  return `
    <span class="network-status offline">
      ● Offline
    </span>
  `
}

async function renderHome() {
  const statistics =
    await getStatistics()

  app.innerHTML = `
    <div class="home-container">

      <header class="home-header">
        <div class="home-header-content">
          <h1>VKU Interview Survey</h1>

          <p>
            Khảo sát tình trạng phỏng vấn
            và nhu cầu việc làm của sinh viên
          </p>

          ${getNetworkStatusHTML()}
        </div>
      </header>

      <main class="home-content">

        <section class="welcome-section">
          <h2>Khảo sát việc làm sinh viên</h2>

          <p>
            Hãy chia sẻ thông tin về quá trình
            phỏng vấn và nhu cầu việc làm của bạn.
          </p>
        </section>

        <section class="statistics-section">

          <h2>📊 Thống kê khảo sát</h2>

          <div class="statistics-grid">

            <div class="stat-card">
              <div class="stat-number">
                ${statistics.total}
              </div>

              <div class="stat-label">
                Sinh viên đã khảo sát
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-number">
                ${statistics.interviewed}
              </div>

              <div class="stat-label">
                Đã từng phỏng vấn
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-number">
                ${statistics.notInterviewed}
              </div>

              <div class="stat-label">
                Chưa từng phỏng vấn
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-number">
                ${statistics.lookingForJob}
              </div>

              <div class="stat-label">
                Đang tìm việc
              </div>
            </div>

          </div>

        </section>

        <section class="home-action">

          <button
            id="startSurveyBtn"
            class="primary-btn"
          >
            📋 Thực hiện khảo sát
          </button>

        </section>

      </main>

    </div>
  `

  document
    .querySelector('#startSurveyBtn')
    .addEventListener(
      'click',
      renderSurvey
    )
}


// ==========================================
// RENDER FORM
// ==========================================

function renderSurvey() {

  app.innerHTML = `

    <div class="app-container">

      <!-- HEADER -->

      <header class="app-header">

        <div>

          <h1>
            VKU Interview Survey
          </h1>

          <p>
            Khảo sát tình trạng phỏng vấn và nhu cầu việc làm
          </p>

        </div>

        ${getNetworkStatusHTML()}

      </header>


      <!-- CONTENT -->

      <main class="content">

        <form id="surveyForm">


          <!-- ==================================
               1. THÔNG TIN SINH VIÊN
          =================================== -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                1. Thông tin sinh viên
              </h2>

              <p>
                Vui lòng cung cấp thông tin cơ bản
              </p>

            </div>


            <div class="form-group">

              <label for="fullName">
                Họ và tên
                <span class="required">*</span>
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                required
              />

            </div>


            <div class="form-group">

              <label for="studentId">
                MSSV
                <span class="required">*</span>
              </label>

              <input
                id="studentId"
                type="text"
                placeholder="Nhập mã số sinh viên"
                required
              />

            </div>


            <div class="form-group">

              <label for="major">
                Ngành
                <span class="required">*</span>
              </label>

              <select
                id="major"
                required
              >

                <option value="">
                  -- Chọn ngành --
                </option>

                <option value="Công nghệ thông tin">
                  Công nghệ thông tin
                </option>

                <option value="Kỹ thuật máy tính">
                  Kỹ thuật máy tính
                </option>

                <option value="Trí tuệ nhân tạo">
                  Trí tuệ nhân tạo
                </option>

                <option value="Kinh doanh số">
                  Kinh doanh số
                </option>

                <option value="Thương mại điện tử">
                  Thương mại điện tử
                </option>

                <option value="Khác">
                  Khác
                </option>

              </select>

            </div>


            <div class="form-group">

              <label for="year">
                Khóa
                <span class="required">*</span>
              </label>

              <select
                id="year"
                required
              >

                <option value="">
                  -- Chọn khóa --
                </option>

                <option value="2022">
                  2022
                </option>

                <option value="2023">
                  2023
                </option>

                <option value="2024">
                  2024
                </option>

                <option value="2025">
                  2025
                </option>

                <option value="2026">
                  2026
                </option>

              </select>

            </div>


            <div class="form-group">

              <label>
                Giới tính
              </label>

              <div class="radio-group">

                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Nam"
                  />
                  Nam
                </label>

                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Nữ"
                  />
                  Nữ
                </label>

                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Khác"
                  />
                  Khác
                </label>

              </div>

            </div>

          </section>


          <!-- ==================================
               2. TÌNH TRẠNG PHỎNG VẤN
          =================================== -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                2. Tình trạng phỏng vấn
              </h2>

              <p>
                Thông tin về quá trình tìm việc của bạn
              </p>

            </div>


            <div class="form-group">

              <label>

                Bạn đã từng tham gia
                phỏng vấn xin việc chưa?

                <span class="required">*</span>

              </label>


              <div class="radio-group">

                <label>

                  <input
                    type="radio"
                    name="interviewed"
                    value="Có"
                    required
                  />

                  Đã từng

                </label>


                <label>

                  <input
                    type="radio"
                    name="interviewed"
                    value="Chưa"
                  />

                  Chưa

                </label>

              </div>

            </div>

          </section>


          <!-- ==================================
               3. ĐÃ PHỎNG VẤN
          =================================== -->

          <section
            class="form-card"
            id="interviewSection"
            style="display: none;"
          >

            <div class="form-title">

              <h2>
                3. Thông tin phỏng vấn
              </h2>

              <p>
                Thông tin về quá trình phỏng vấn
              </p>

            </div>


            <div class="form-group">

              <label for="interviewCount">
                Số lần đã phỏng vấn
              </label>

              <input
                id="interviewCount"
                type="number"
                min="1"
                placeholder="Ví dụ: 2"
              />

            </div>


            <div class="form-group">

              <label for="company">
                Công ty đã phỏng vấn
              </label>

              <input
                id="company"
                type="text"
                placeholder="Tên công ty"
              />

            </div>


            <div class="form-group">

              <label for="position">
                Vị trí ứng tuyển
              </label>

              <input
                id="position"
                type="text"
                placeholder="Ví dụ: Tester, Developer..."
              />

            </div>


            <div class="form-group">

              <label for="interviewLocation">
                Địa điểm phỏng vấn
              </label>

              <input
                id="interviewLocation"
                type="text"
                placeholder="Ví dụ: Đà Nẵng"
              />

            </div>


            <div class="form-group">

              <label>
                Hình thức phỏng vấn
              </label>

              <div class="radio-group">

                <label>

                  <input
                    type="radio"
                    name="interviewType"
                    value="Trực tiếp"
                  />

                  Trực tiếp

                </label>


                <label>

                  <input
                    type="radio"
                    name="interviewType"
                    value="Online"
                  />

                  Online

                </label>

              </div>

            </div>


            <div class="form-group">

              <label for="result">
                Kết quả
              </label>

              <select id="result">

                <option value="">
                  -- Chọn kết quả --
                </option>

                <option value="Đậu">
                  Đậu
                </option>

                <option value="Rớt">
                  Rớt
                </option>

                <option value="Đang chờ">
                  Đang chờ
                </option>

                <option value="Khác">
                  Khác
                </option>

              </select>

            </div>

          </section>


          <!-- ==================================
               3. CHƯA PHỎNG VẤN
          =================================== -->

          <section
            class="form-card"
            id="notInterviewSection"
            style="display: none;"
          >

            <div class="form-title">

              <h2>
                3. Nhu cầu việc làm
              </h2>

              <p>
                Hãy cho chúng tôi biết thêm về nhu cầu của bạn
              </p>

            </div>


            <div class="form-group">

              <label>
                Bạn có đang tìm kiếm việc làm không?
              </label>

              <div class="radio-group">

                <label>

                  <input
                    type="radio"
                    name="lookingForJob"
                    value="Có"
                  />

                  Có

                </label>


                <label>

                  <input
                    type="radio"
                    name="lookingForJob"
                    value="Không"
                  />

                  Không

                </label>

              </div>

            </div>


            <div class="form-group">

              <label for="reason">
                Lý do chưa tham gia phỏng vấn
              </label>

              <textarea
                id="reason"
                rows="4"
                placeholder="Nhập lý do..."
              ></textarea>

            </div>

          </section>


          <!-- ==================================
               4. MONG MUỐN VIỆC LÀM
          =================================== -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                4. Mong muốn việc làm
              </h2>

              <p>
                Chia sẻ công việc bạn đang hướng đến
              </p>

            </div>


            <div class="form-group">

              <label for="jobWish">
                Bạn mong muốn công việc như thế nào?
              </label>

              <textarea
                id="jobWish"
                rows="5"
                placeholder="Ví dụ: Tester, QA, Developer..."
              ></textarea>

            </div>

          </section>


          <!-- ==================================
               5. LOCATION
          =================================== -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                5. Thông tin vị trí
              </h2>

              <p>
                Có thể lấy vị trí hiện tại của bạn
              </p>

            </div>


            <div class="location-row">

              <button
                type="button"
                id="locationBtn"
                class="secondary-btn"
              >

                📍 Lấy location

              </button>


              <span id="locationStatus">

                Chưa lấy vị trí

              </span>

            </div>

          </section>


          <!-- ==================================
               6. ẢNH
          =================================== -->

          <section class="form-card">

            <div class="form-title">

              <h2>
                6. Ảnh
              </h2>

              <p>
                Không bắt buộc
              </p>

            </div>


            <div class="form-group">

              <input
                id="image"
                type="file"
                accept="image/*"
                capture="environment"
              />


              <small>

                Có thể chụp ảnh hoặc
                chọn ảnh từ thiết bị.

              </small>


              <div id="imagePreview"></div>

            </div>

          </section>


          <!-- ==================================
               SUBMIT
          =================================== -->

          <div class="form-actions">

            <button
              type="submit"
              class="primary-btn"
            >

              💾 Gửi khảo sát

            </button>

          </div>


        </form>

      </main>

    </div>
  `


  setupSurveyEvents()
}


// ==========================================
// SETUP EVENTS
// ==========================================

function setupSurveyEvents() {


  // ----------------------------------------
  // Đã phỏng vấn / Chưa
  // ----------------------------------------

  document
    .querySelectorAll(
      'input[name="interviewed"]'
    )
    .forEach((radio) => {

      radio.addEventListener(
        'change',
        updateInterviewSection
      )

    })


  // ----------------------------------------
  // GPS
  // ----------------------------------------

  document
    .querySelector('#locationBtn')
    .addEventListener(
      'click',
      getLocation
    )


  // ----------------------------------------
  // Ảnh
  // ----------------------------------------

  document
    .querySelector('#image')
    .addEventListener(
      'change',
      handleImage
    )


  // ----------------------------------------
  // Submit
  // ----------------------------------------

  document
    .querySelector('#surveyForm')
    .addEventListener(
      'submit',
      submitSurvey
    )
}


// ==========================================
// HIỂN THỊ PHẦN PHỎNG VẤN
// ==========================================

function updateInterviewSection() {

  const selected =
    document.querySelector(
      'input[name="interviewed"]:checked'
    )


  if (!selected) {
    return
  }


  const interviewSection =
    document.querySelector(
      '#interviewSection'
    )


  const notInterviewSection =
    document.querySelector(
      '#notInterviewSection'
    )


  if (selected.value === 'Có') {

    interviewSection.style.display =
      'block'

    notInterviewSection.style.display =
      'none'

  } else {

    interviewSection.style.display =
      'none'

    notInterviewSection.style.display =
      'block'
  }
}


// ==========================================
// GPS
// ==========================================

function getLocation() {

  const button =
    document.querySelector(
      '#locationBtn'
    )


  const status =
    document.querySelector(
      '#locationStatus'
    )


  if (!navigator.geolocation) {

    alert(
      'Thiết bị không hỗ trợ GPS.'
    )

    return
  }


  button.disabled = true

  button.textContent =
    '📍 Đang lấy vị trí...'


  navigator.geolocation.getCurrentPosition(

    (position) => {

      surveyData.location = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude

      }


      status.textContent =
        `Đã lấy: ${
          position.coords.latitude.toFixed(6)
        }, ${
          position.coords.longitude.toFixed(6)
        }`


      button.disabled = false

      button.textContent =
        '📍 Lấy lại location'

    },


    (error) => {

      console.error(
        'GPS error:',
        error
      )


      alert(
        'Không thể lấy vị trí. Hãy kiểm tra quyền truy cập vị trí.'
      )


      button.disabled = false

      button.textContent =
        '📍 Lấy location'
    },

    {
      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 0
    }
  )
}


// ==========================================
// ẢNH
// ==========================================

function handleImage(event) {

  const file =
    event.target.files[0]


  if (!file) {
    return
  }


  const reader =
    new FileReader()


  reader.onload = () => {

    surveyData.image =
      reader.result


    document.querySelector(
      '#imagePreview'
    ).innerHTML = `

      <img
        src="${reader.result}"
        class="survey-image-preview"
        alt="Ảnh khảo sát"
      />

    `
  }


  reader.readAsDataURL(file)
}


// ==========================================
// TẠO DATA KHẢO SÁT
// ==========================================

function collectSurveyData() {


  const interviewed =
    document.querySelector(
      'input[name="interviewed"]:checked'
    )?.value || ''


  const gender =
    document.querySelector(
      'input[name="gender"]:checked'
    )?.value || ''


  const interviewType =
    document.querySelector(
      'input[name="interviewType"]:checked'
    )?.value || ''


  const lookingForJob =
    document.querySelector(
      'input[name="lookingForJob"]:checked'
    )?.value || ''


  return {

    id:
      crypto.randomUUID(),


    fullName:
      document
        .querySelector('#fullName')
        .value
        .trim(),


    studentId:
      document
        .querySelector('#studentId')
        .value
        .trim(),


    major:
      document
        .querySelector('#major')
        .value,


    year:
      document
        .querySelector('#year')
        .value,


    gender,


    interviewed,


    interviewCount:
      document
        .querySelector('#interviewCount')
        .value || '',


    company:
      document
        .querySelector('#company')
        .value
        .trim(),


    position:
      document
        .querySelector('#position')
        .value
        .trim(),


    interviewLocation:
      document
        .querySelector('#interviewLocation')
        .value
        .trim(),


    interviewType,


    result:
      document
        .querySelector('#result')
        .value,


    lookingForJob,


    reason:
      document
        .querySelector('#reason')
        .value
        .trim(),


    jobWish:
      document
        .querySelector('#jobWish')
        .value
        .trim(),


    location:
      surveyData.location || null,


    image:
      surveyData.image || null,


    status:
      'PENDING_SYNC'
  }
}


// ==========================================
// GỬI 1 KHẢO SÁT LÊN GOOGLE SHEET
// ==========================================

async function syncSurvey(survey) {

  console.log(
    'Đang đồng bộ khảo sát:',
    survey.id
  )


  const response =
    await fetch(
      API_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'text/plain;charset=utf-8'
        },

        body:
          JSON.stringify(survey)
      }
    )


  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    )
  }


  const result =
    await response.json()


  console.log(
    'Apps Script:',
    result
  )


  if (!result.success) {

    throw new Error(
      result.message ||
      'Google Sheet không nhận dữ liệu'
    )
  }


  // Đồng bộ thành công

  survey.status =
    'SYNCED'


  await saveSurvey(
    survey
  )


  console.log(
    'Đồng bộ thành công:',
    survey.id
  )
}


// ==========================================
// ĐỒNG BỘ TẤT CẢ KHẢO SÁT ĐANG CHỜ
// ==========================================

async function syncPendingSurveys() {

  if (!navigator.onLine) {

    console.log(
      'Đang offline, chưa đồng bộ.'
    )

    return
  }


  try {

    const allSurveys =
      await getAllSurveys()


    const pendingSurveys =
      allSurveys.filter(
        (survey) =>
          survey.status !== 'SYNCED'
      )


    console.log(
      `Có ${pendingSurveys.length} khảo sát đang chờ đồng bộ.`
    )


    if (
      pendingSurveys.length === 0
    ) {

      return
    }


    for (
      const survey
      of pendingSurveys
    ) {

      try {

        await syncSurvey(
          survey
        )

      } catch (error) {

        console.error(
          'Không thể đồng bộ khảo sát:',
          survey.id,
          error
        )

        // Dừng tại đây.
        // Lần sau có mạng sẽ thử lại.

        break
      }
    }

  } catch (error) {

    console.error(
      'Lỗi lấy dữ liệu IndexedDB:',
      error
    )
  }
}


// ==========================================
// SUBMIT KHẢO SÁT
// ==========================================

async function submitSurvey(event) {

  event.preventDefault()


  const form =
    document.querySelector(
      '#surveyForm'
    )


  // Kiểm tra HTML required

  if (!form.checkValidity()) {

    form.reportValidity()

    return
  }


  // Tạo dữ liệu

  const survey =
    collectSurveyData()


  // ----------------------------------------
  // LƯU LOCAL TRƯỚC
  // ----------------------------------------

  try {

    await saveSurvey(
      survey
    )


    console.log(
      'Đã lưu khảo sát vào IndexedDB:',
      survey.id
    )

  } catch (error) {

    console.error(
      'Lỗi lưu IndexedDB:',
      error
    )


    alert(
      'Không thể lưu khảo sát trên thiết bị.'
    )


    return
  }


  // ----------------------------------------
  // OFFLINE
  // ----------------------------------------

  if (!navigator.onLine) {

    alert(
      'Đã lưu khảo sát offline. Khi có mạng, dữ liệu sẽ tự động đồng bộ.'
    )


    form.reset()


    surveyData = {}


    document.querySelector(
      '#interviewSection'
    ).style.display = 'none'


    document.querySelector(
      '#notInterviewSection'
    ).style.display = 'none'


    document.querySelector(
      '#locationStatus'
    ).textContent =
      'Chưa lấy vị trí'


    document.querySelector(
      '#imagePreview'
    ).innerHTML = ''


    return
  }


  // ----------------------------------------
  // ONLINE
  // ----------------------------------------

  try {

    await syncSurvey(
      survey
    )


    alert(
      'Gửi khảo sát thành công!'
    )


    // Reset form

    form.reset()


    surveyData = {}


    document.querySelector(
      '#interviewSection'
    ).style.display = 'none'


    document.querySelector(
      '#notInterviewSection'
    ).style.display = 'none'


    document.querySelector(
      '#locationStatus'
    ).textContent =
      'Chưa lấy vị trí'


    document.querySelector(
      '#imagePreview'
    ).innerHTML = ''


  } catch (error) {

    console.error(
      'Lỗi đồng bộ:',
      error
    )


    alert(
      'Đã lưu khảo sát trên thiết bị nhưng chưa đồng bộ được. Hệ thống sẽ tự động thử lại khi có mạng.'
    )
  }
}


// ==========================================
// KHI CÓ MẠNG TRỞ LẠI
// ==========================================

window.addEventListener(
  'online',
  async () => {

    console.log(
      'Đã có kết nối mạng trở lại.'
    )


    // Cập nhật trạng thái Online

    const status =
      document.querySelector(
        '.network-status'
      )


    if (status) {

      status.className =
        'network-status online'

      status.textContent =
        '● Online'
    }


    // Tự động đồng bộ

    await syncPendingSurveys()
  }
)


// ==========================================
// KHI MẤT MẠNG
// ==========================================

window.addEventListener(
  'offline',
  () => {

    console.log(
      'Thiết bị đang offline.'
    )


    const status =
      document.querySelector(
        '.network-status'
      )


    if (status) {

      status.className =
        'network-status offline'

      status.textContent =
        '● Offline'
    }
  }
)


// ==========================================
// KHỞI ĐỘNG APP
// ==========================================

renderHome()


// ==========================================
// KIỂM TRA ĐỒNG BỘ KHI MỞ APP
// ==========================================

syncPendingSurveys()
  .catch((error) => {

    console.error(
      'Lỗi đồng bộ khi khởi động:',
      error
    )
  })


// ==========================================
// SERVICE WORKER
// ==========================================

// Không đăng ký Service Worker ở localhost.
// Điều này giúp Vite cập nhật code ngay khi đang phát triển.

if (
  'serviceWorker' in navigator &&
  window.location.hostname !== 'localhost'
) {

  window.addEventListener(
    'load',
    async () => {

      try {

        const registration =
          await navigator.serviceWorker.register(
            '/sw.js'
          )


        console.log(
          '[PWA] Service Worker registered:',
          registration.scope
        )

      } catch (error) {

        console.error(
          '[PWA] Service Worker registration failed:',
          error
        )
      }
    }
  )
}