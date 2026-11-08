# WhatsApp Business templates

Mashbak sends WhatsApp messages through the **WhatsApp Business Cloud API** using pre-approved templates.
Create each template below in **Meta Business Suite → WhatsApp Manager → Message templates**:

- Category: **Utility**
- Name: exactly as written (for example `mashbak_application_approved`)
- Languages: add **Arabic (ar)**, **English (en)** and **Hebrew (he)** under the same name
- Body: paste the text. Each `{{n}}` is filled by the platform in the order shown.

You can rename a template or force one language per template from the admin dashboard: **Notifications → Templates**.

## `mashbak_application_received`

Variables: `{{1}}` = name

- **ar**: أهلًا {{1}}، استلمنا طلب انضمامك إلى مشبك وسيقوم فريقنا بمراجعته قريبًا. سنبلغك فور اتخاذ القرار.
- **en**: Hi {{1}}, we received your application to Mashbak. Our team will review it soon and let you know.
- **he**: שלום {{1}}, קיבלנו את בקשת ההצטרפות שלך למשבק. הצוות שלנו יבחן אותה בקרוב ונעדכן אותך.

## `mashbak_application_approved`

Variables: `{{1}}` = name

- **ar**: مبروك {{1}}! تمّت الموافقة على طلب انضمامك إلى مشبك. ادخل إلى mashbak.org بنفس البريد الإلكتروني وأكمل ملفك الشخصي.
- **en**: Congratulations {{1}}! Your Mashbak application was approved. Sign in at mashbak.org with the same email and complete your profile.
- **he**: מזל טוב {{1}}! הבקשה שלך למשבק אושרה. התחבר/י ב-mashbak.org עם אותו אימייל והשלם/י את הפרופיל.

## `mashbak_application_rejected`

Variables: `{{1}}` = name

- **ar**: أهلًا {{1}}، شكرًا لاهتمامك بمشبك. لم نتمكن من قبول طلبك في هذه المرحلة، وأرسلنا لك التفاصيل بالبريد الإلكتروني.
- **en**: Hi {{1}}, thank you for your interest in Mashbak. We couldn't accept your application at this stage. We emailed you the details.
- **he**: שלום {{1}}, תודה על ההתעניינות במשבק. לא יכולנו לקבל את הבקשה בשלב זה. שלחנו לך את הפרטים במייל.

## `mashbak_connection_request`

Variables: `{{1}}` = name, `{{2}}` = from

- **ar**: أهلًا {{1}}، أرسل لك {{2}} طلب تواصل على مشبك. ادخل إلى المنصة لقبوله أو رفضه.
- **en**: Hi {{1}}, {{2}} sent you a connection request on Mashbak. Open the platform to accept or decline.
- **he**: שלום {{1}}, {{2}} שלח/ה לך בקשת קשר במשבק. היכנס/י למערכת כדי לאשר או לדחות.

## `mashbak_connection_accepted`

Variables: `{{1}}` = name, `{{2}}` = from

- **ar**: أهلًا {{1}}، قبل {{2}} طلب التواصل على مشبك. يمكنك الآن رؤية تفاصيل التواصل.
- **en**: Hi {{1}}, {{2}} accepted your connection request on Mashbak. You can now see their contact details.
- **he**: שלום {{1}}, {{2}} אישר/ה את בקשת הקשר במשבק. עכשיו אפשר לראות את פרטי הקשר.

## `mashbak_job_application`

Variables: `{{1}}` = name, `{{2}}` = from, `{{3}}` = job

- **ar**: أهلًا {{1}}، قدّم {{2}} طلبًا على الوظيفة التي نشرتها: {{3}}. راجع الطلب على مشبك.
- **en**: Hi {{1}}, {{2}} applied to the job you posted: {{3}}. Review it on Mashbak.
- **he**: שלום {{1}}, {{2}} הגיש/ה מועמדות למשרה שפרסמת: {{3}}. אפשר לבחון אותה במשבק.

## `mashbak_job_application_update`

Variables: `{{1}}` = name, `{{2}}` = job

- **ar**: أهلًا {{1}}، هناك تحديث على طلبك لوظيفة {{2}}. التفاصيل على مشبك.
- **en**: Hi {{1}}, there's an update on your application for {{2}}. Details on Mashbak.
- **he**: שלום {{1}}, יש עדכון לגבי המועמדות שלך למשרה {{2}}. הפרטים במשבק.

## `mashbak_event_registered`

Variables: `{{1}}` = name, `{{2}}` = event, `{{3}}` = when

- **ar**: أهلًا {{1}}، تم تسجيلك إلى {{2}} بتاريخ {{3}}. تذكرتك موجودة على مشبك.
- **en**: Hi {{1}}, you're registered for {{2}} on {{3}}. Your ticket is on Mashbak.
- **he**: שלום {{1}}, נרשמת ל{{2}} ב-{{3}}. הכרטיס שלך מחכה במשבק.

## `mashbak_event_waitlisted`

Variables: `{{1}}` = name, `{{2}}` = event

- **ar**: أهلًا {{1}}، الفعالية {{2}} ممتلئة حاليًا وأضفناك إلى قائمة الانتظار. سنبلغك إذا تحرر مكان.
- **en**: Hi {{1}}, {{2}} is full right now and you're on the waitlist. We'll tell you if a seat opens.
- **he**: שלום {{1}}, האירוע {{2}} מלא כרגע ואת/ה ברשימת ההמתנה. נעדכן אם יתפנה מקום.

## `mashbak_event_promoted`

Variables: `{{1}}` = name, `{{2}}` = event, `{{3}}` = when

- **ar**: أهلًا {{1}}، تحرر مكان في {{2}} وأصبحت مسجلًا. الموعد: {{3}}.
- **en**: Hi {{1}}, a seat opened at {{2}} and you're now registered. When: {{3}}.
- **he**: שלום {{1}}, התפנה מקום ב{{2}} ונרשמת. מתי: {{3}}.

## `mashbak_event_reminder`

Variables: `{{1}}` = name, `{{2}}` = event, `{{3}}` = when

- **ar**: أهلًا {{1}}، تذكير بفعالية {{2}} بتاريخ {{3}}. نراك هناك!
- **en**: Hi {{1}}, a reminder about {{2}} on {{3}}. See you there!
- **he**: שלום {{1}}, תזכורת לאירוע {{2}} ב-{{3}}. נתראה שם!

## `mashbak_broadcast`

Variables: `{{1}}` = name, `{{2}}` = title

- **ar**: أهلًا {{1}}، رسالة جديدة من مشبك: {{2}}. التفاصيل على المنصة.
- **en**: Hi {{1}}, a new message from Mashbak: {{2}}. Details on the platform.
- **he**: שלום {{1}}, הודעה חדשה ממשבק: {{2}}. הפרטים במערכת.
