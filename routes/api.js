const Router    = Helper('router');

Router.get('/',(req,res,next) =>{
    res.send('Node JS V1.0 API Running ........');
});

Router._resource_api('/test','TestController');

Router._post('/login','AuthenticationController@doAuthorization');
Router._post('/login/social','AuthenticationController@doSocialAuthorization');
Router._post('/password/reset','AuthenticationController@passwordReset');
Router._post('/password/reset/token','AuthenticationController@passwordResetToken');
Router._post('/password/reset/profile','AuthenticationController@profilePassowrdReset');
Router._post('/password/reset/force','AuthenticationController@forcePasswordReset');
Router._get('/account/verify/:token','AuthenticationController@tokenVerify');


Router._group('/auth',function(Router){
    Router._get('/module/permissions','AuthenticationController@getModuleWithPermissions');
    Router._get('/permission/:user_id','AuthenticationController@getPermissions');
    Router._get('/role/:user_id','AuthenticationController@getRoles');
    Router._get('/permission/:user_id/check','AuthenticationController@hasPermission');
    Router._get('/role/:user_id/check','AuthenticationController@hasRole');
});

Router._group('/utility',function(Router){
    Router._post('/email/check','UtilityController@hasEmail');
    Router._get('/application/config','UtilityController@applicationConfig');
    Router._get('/location/countries','UtilityController@getCountries');
    Router._get('/location/states/:country_id','UtilityController@getStatesByCountryId');
    Router._get('/location/cities/:state_id','UtilityController@getCitiesByStateId');
    Router._get('/course/related','UtilityController@getRelatedCourses');
    Router._get('/s3/file-remove','UtilityController@removeFileFromS3');
    Router._post('/course/status','UtilityController@courseStatusUpdate');
    Router._get('/product/search','UtilityController@productSearch');
    Router._post('/product/status','UtilityController@updateProductStatus');
    Router._post('/product/status/featured','UtilityController@updateFeaturedProduct');
    Router._post('/order-address/default','UtilityController@changeDefaultAddress');
    Router._get('/product/search/autocomplete','UtilityController@productAutoCompleteSearch');
    Router._get('/check-tutor-course/:slug/:user_id','UtilityController@checkTutorCourse');
    Router._post('/course-user/status/:id','UtilityController@courseUserStatusUpdate');
    Router._post('/course-lecture/update/:id','UtilityController@courseLectureUpdate');
    Router._post('/course-progress-reset','UtilityController@courseProgressReset');
    Router._get('/notifiy-view-date/:id','UtilityController@notificationViewDate');
    Router._get('/lastest-dashboard-notifications/:id','UtilityController@lastestDashboardNotifications');
    Router._post('/coupon/verify','UtilityController@couponVerify');
    Router._post('/course/upload/certificate/:id','UtilityController@courseUploadCertificate');
    Router._get('/action/:type/:table/:id/:userType/:sender_id','UtilityController@enableDiableAction');
    Router._get('/soft-delete/:table/:id/:userType/:sender_id','UtilityController@softDeleteAction');
    Router._post('/sxl-payment-address','UtilityController@sxlAddressUpdate');
    Router._post('/reseller-product-soft-delete','UtilityController@resellerProductSoftDelete');
    Router._post('/reseller-product-approved','UtilityController@resellerProductApproval');
    Router._post('/kyc-approved','UtilityController@isKycApprove');
    Router._post('/vendor-agreement','UtilityController@vendorAgreement');
    Router._get('/payment-type','UtilityController@getPaymentType');
    Router._post('/product-prices','UtilityController@setProductPrice');
    Router._delete('/product-price-free/:id','UtilityController@setProductPriceFree');
    Router._get('/course-order-status/:id','UtilityController@checkCourseOrderStatus');
    Router._get('/settings','UtilityController@getConfigSetting');
    Router._get('/price/delete/:type/:id','UtilityController@productPriceDelate');
    Router._get('/my-event/:userId','UtilityController@getMyEventList');
    Router._put('/product-left-panel/:type','UtilityController@product_left_panel');
    Router._get('/is-fast-selling/:id/:type/:isFastSelling','UtilityController@is_fast_selling');
    Router._get('/commission-report','UtilityController@getCommissionReport');
    Router._get('/sales-report','UtilityController@salesReport');
    Router._get('/event-ticket-resend-details','UtilityController@eventTicketResendDetails');
    Router._post('/resend-event-ticket','UtilityController@resendEventTicket');
    Router._post('/admin/approved','UtilityController@adminApprove');
});

Router._group('/ticket',function(Router){
    Router._post('/create-ticket','TicketController@createTicket');
    Router._get('/view-all-ticket','TicketController@index');
    Router._get('/details/:ticketId','TicketController@show');
    Router._get('/conversation','TicketController@ticketConversations');
    Router._put('/reply/:ticketId','TicketController@ticketReply');
    Router._put('/update/:ticketId','TicketController@ticketUpdate');
    Router._get('/search','TicketController@search');
});

Router._resource_api('/report-abuse','ReportAbuseController');
Router._resource_api('/contact','ContactController');
Router._resource_api('/user','UserController');
Router._resource_api('/user-bank-information','UserBankInformationController');
Router._resource_api('/profile','ProfileController');
Router._resource_api('/role','RoleController');
Router._resource_api('/permission','PermissionController');
Router._resource_api('/category','CategoryController');
Router._resource_api('/cms-page','CmsPageController');
Router._resource_api('/page-slider','PageSliderController');
Router._resource_api('/announcement','UserAnnouncementController');

Router._resource_api('/course','`Course`/CourseController');
Router._resource_api('/course-module','Course/CourseModuleController');
Router._resource_api('/course-lecture','Course/CourseLectureController');
Router._resource_api('/course-stander','Course/CourseStanderController');
Router._resource_api('/course-time','Course/CourseTimeController');
Router._resource_api('/course-target','Course/CourseTargetController');
Router._resource_api('/course-target-answer','Course/CourseTargetAnswerController');
Router._resource_api('/course-discussion','Course/CourseDiscussionController');
Router._resource_api('/course-coupon','Course/CourseCouponController');
Router._resource_api('/course-communication','Course/CourseCommunicationController');
Router._resource_api('/course-user','Course/UserCourseController');
Router._resource_api('/course-progress','Course/UserCourseProgressController');
Router._resource_api('/course-discussion-response','Course/CourseDiscussionsResponseController');
// Router._resource_api('/course-promotions','Course/CoursePromotionsController');


Router._resource_api('/product','Product/ProductController');
Router._resource_api('/event','Product/EventController');
Router._resource_api('/reseller-product','Reseller/ResellerController.js');
Router._resource_api('/favourities','Product/FavouritesController');
Router._resource_api('/wishlist','Product/WishlistsController');
Router._resource_api('/product-offer','ProductOfferController');

Router._resource_api('/orders','Order/OrdersController');
Router._resource_api('/order-address','Order/OrderAddressController');
Router._resource_api('/order-details','Order/OrderDetailsController');

Router._resource_api('/event-speakers','EventSpeakersController');

Router._resource_api('/ticket-category','Ticket/TicketCategoryController');
Router._resource_api('/ticket-support','Ticket/TicketSupportController');
Router._resource_api('/ticket-comments','Ticket/TicketCommentsController');

Router._resource_api('/wallets','Wallets/WalletsController');
Router._resource_api('/wallet-transactions','Wallets/WalletTransactionsController');

Router._resource_api('/ratings','RatingsController');

Router._resource_api('/reviews','Review/ReviewsController');
Router._resource_api('/review-questions','Review/ReviewQuestions');
Router._resource_api('/review-options','Review/ReviewOptions');
Router._resource_api('/review-details','Review/ReviewDetails');

Router._resource_api('/testimonial','TestimonialController');

Router._resource_api('/comments','CommentsController');

Router._resource_api('/payout','PayoutController');

Router._resource_api('/dashboard/:userId','DashboardController');

Router._resource_api('/payment-category','PaymentCategoryController');

Router._resource_api('/brands','BrandsController');


Router._group('/payment',function(Router){
    Router._post('/paytypecheck','PaymentController@paymentTypeCheck');
    Router._post('/wallet','PaymentController@paymentWallet');
    Router._post('/paycs','PaymentController@paymentCyberSource');

    Router._post('/create-checkout-session', 'PaymentController@stripeSession');
    
   // Router._get('/refund/:userCourseId','PaymentController@paymentRefund');
    Router._post('/sxl-address-generate','PaymentController@sxlAddressGenerate');
    Router._get('/sxl-address-check/:address','PaymentController@sxlAddressCheck');
    Router._post('/order-payment-details','PaymentController@orderPaymentDetails');
    Router._put('/order-status-update/:orderId','PaymentController@orderStatusUpdate');
});
Router._group('/notification',function(Router){
    Router._get('/admin/course/:course_id','NotificationController@courseNotificationAlertToAdmin');
    Router._get('/list','NotificationController@index');
    Router._post('/create','NotificationController@store');
    Router._put('/delete/:id','NotificationController@soft_delete');
});

Router._resource_api('/our-team','OurTeamController');
Router._resource_api('/video','VideoController');
Router._resource_api('/site-setting','SettingController');
Router._resource_api('/attendee-info','AttendeeInformationController');
Router._resource_api('/attendee-details','AttendeeDetailsController');

module.exports = Router;