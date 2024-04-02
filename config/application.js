const applicationData = {

    email: {
        contact: 'support.marketplace@successlife.com',
        logo: 'https://demostore.successlife.com/images/logo.png',
        copy_right: 'Copyrights © 2019 All Rights Reserved - Successlife.',
        page_link: [
            { label: 'Terms & Condition', link: 'https://demostore.successlife.com/terms' },
            { label: 'Privacy Policy', link: 'https://demostore.successlife.com/privacy-policy' },
            //{label:'Contact',link:'https://demostore.successlife.com/contact'},
        ],
        social: [
            { label: 'Facebook', icon: 'https://demostore.successlife.com/images/fb_icon.png', link: 'https://www.facebook.com/SuccessLifeGL' },
            { label: 'Linkedin', icon: 'https://demostore.successlife.com/images/in_icon.png', link: 'https://www.linkedin.com/company/successlife' },
            { label: 'Twitter', icon: 'https://demostore.successlife.com/images/twitter_icon.png', link: 'https://twitter.com/SuccessLifeGL' },
            { label: 'Youtube', icon: 'https://demostore.successlife.com/images/utube_icon.png', link: 'https://www.youtube.com/channel/UCkJBDROXjrWlJ1vYWaYGVIA' },
        ],
        url: 'https://demostore.successlife.com/',
    },

    social_links: [
        'facebook', 'twitter', 'linkedin', 'website'
    ],

    priority_level: [
        'low', 'medium', 'high'
    ],

    review_area: [
        'product', 'course', 'user'
    ],

    product_type: [
        'product', 'event_ticket'
    ],

    course_status: [
        'draft', 'publish', 'unpublish'
    ],

    product_status: [
        'draft', 'publish', 'unpublish'
    ],

    price_type: [
        'USD', 'SXL', 'FREE'
    ],

    payment_status: [
        'complete','cancel','pending','return','failed'
    ],

    order_status: [
        'complete', 'cancel', 'pending', 'return'
    ],

    productable_type: [
        'products', 'courses','course_promotions'
    ],

    favourites_type: [
        'products', 'courses'
    ],
    ticket_support_type: [
        'products', 'courses'
    ],
    slider_page: [
        'home', 'about', 'vendor-register', 'how-it-works','course-listing'
    ],
    wishlistable_type: [
        'products', 'courses'
    ],
    match_hostname: [
        's3.ap-southeast-1.amazonaws.com', 'marketplace.successlife.com'
    ],

    user_course_status: [
        'enrolled', 'running', 'completed', 'expired'
    ],

    wallet_transactions_type: [
        'products', 'courses'
    ],
    reviews_type: [
        'products', 'courses', 'user'
    ],
    event_unique_id : '#SLME',
    event_ticket_no : '#SLMET',
    product_image_ratio: [
        {
            key: 'thumbnail',
            width: 290,
            height: 176,
            aspect: '2:3!h',
            quality: 80
        },
        {
            key: 'banner',
            height: 536,
            width: 381,
            aspect: '3:2!h',
            quality: 80
        }
    ],

    course_image_ratio: [
        {
            key: 'large',
            height: 1000,
            width: 1000,
            aspect: '1:1!h',
            quality: 80
        },
        {
            key: 'banner',
            height: 1900,
            width: 500,
            aspect: '3:2!h',
            quality: 80
        },
        {
            key: 'thumbnail',
            height: 400,
            width: 387,
            aspect: '3:2!h',
            quality: 80
        },
        {
            key: 'small',
            height: 187,
            width: 98,
            aspect: '3:2!h',
            quality: 80
        }
    ],

    barCodeResizeObj:[
        {
            maxHeight: 501,
            maxWidth: 109,
            aspect: '1:1',
        }
    ],
    review_questions: [
        'product', 'course', 'user'
    ],


    commentable_type: [
        'products', 'courses'
    ],
    payment_mode: [
        'C',  'W',  'CS',  'SXL',  'WCS',  'WSLX', 'FREE'
    ],
    order_address_type: [
        'home', 'office', 'others'
    ],

    reviewable_type: [
        'products', 'courses'
    ],

    wallet_transactions_description: 'Wallet transaction description',

    vendor_wallet_transactions_description: 'Amount credited against order',

    refund_wallet_description: 'Refund Wallet description',

    payout_description: 'Payout generated for',

    customer_wallet_refund_description: 'Amount refund for order',
    customer_wallet_redeem_description: 'Wallet amount used for order',

    payout_procession_fees: '0',

    // sxl_to_usd_rate: '1.00',

    amount_divisor: 2,

    pricable_type:[
        'courses','products'
    ],

    payouts_status: [
        'complete', 'cancel', 'pending'
    ],
    payment_wallet_user_role : [
        'vendor','customer'
    ],

    account_type : [
        'Savings Account',  'Current Accounts',  'Salary Accounts',  'Deposits', 'Safe Deposit Locker',  'Rural Accounts' ,'Regular Savings','Recurring Deposit Account','Fixed Deposit Account','DEMAT Account','NRI Accounts'
    ],
    notification_account_type : [
        'manual', 'system_generated'
    ],
    notification_role : [
        'vendor', 'admin','all','customer','reseller'
    ],
    // refund_day_interval : 5,

    new_customer_follow_up: 5, // days

    enable_disable_action:[
        'active','in_active'
    ],
    enable_disable_action_table:[
        'courses','categories','event_tickets'
    ],
    soft_delete_table:[
        'courses','event_tickets'
    ],
    course_promotion_status: [
        'active', 'inactive', 'expire'
    ],
    reseller_product_status: [
        'active', 'inactive', 'expire'
    ],

    // vendor_commission: 50,
    // reseller_commission: 20,
    orderPrefix : '#SLM100',
    eventPrefix : '#SLME100',

    category_type: [
        'courses','products','events'
    ],

    video_type:[
        'courses','events','products'
    ],
    ticket_subject:[
        'Payment issues','Event ticket email not received','SXL issues','Payout issues','Tutor commission issues etc','Others'
    ],
    ticket_status:[
        '2','3','4','5','6','7'
    ],
    ticket_priority:[
        '1','2','3','4'
    ],
    flex_card_type : ['001','002','003','004','005','006','007','024','036','042'],
    error_code: [
        { code: 401, message: 'Unauthorized Access' },
        { code: 403, message: 'Permission issue' },
        { code: 404, message: 'Page Not found' },
        { code: 422, message: 'Unprocessable Entity' },
        { code: 500, message: 'Internal Server Error' },
        { code: 503, message: 'Service unavailable' },
    ],
    cs_reason_code: [
        { code: 100, message: "Successful transaction.AIBMS: If ccAuthReply_processorResponse is 08, you can accept the transaction if the customer provides you with identification." },
        { code: 101, message: "The request is missing one or more required fields.Possible action: see the reply fields missingField_0 through missingField_Nfor which fields are missing. Resend the request with the complete information. For information about missing or invalid fields, see Getting Started with CyberSource Advanced for the Simple Order API." },
        { code: 102, message: "One or more fields in the request contains invalid data.Possible action: see the reply fields invalidField_0 through invalidField_N for which fields are invalid. Resend the request with the correct information. For information about missing or invalid fields, see Getting Started with CyberSource Advanced for the Simple Order API." },
        { code: 104, message: "The merchant reference code for this authorization request matches the merchant reference code of another authorization request that you sent within the past 15 minutes.Possible action: Resend the request with a unique merchant reference code." },
        { code: 110, message: "Only a partial amount was approved.Possible action: see Partial Authorizations." },
        { code: 150, message: "General system failure.See the documentation for your CyberSource client for information about handling retries in the case of system errors." },
        { code: 151, message: "The request was received but there was a server timeout. This error does not include timeouts between the client and the server.Possible action: To avoid duplicating the transaction, do not resend the request until you have reviewed the transaction status in the Business Center. See the documentation for your CyberSource client for information about handling retries in the case of system errors." },
        { code: 152, message: "The request was received, but a service did not finish running in time.Possible action: To avoid duplicating the transaction, do not resend the request until you have reviewed the transaction status in the Business Center. See the documentation for your CyberSource client for information about handling retries in the case of system errors." },
        { code: 200, message: "The authorization request was approved by the issuing bank but declined by CyberSource because it did not pass the Address Verification System (AVS) check.Possible action: You can capture the authorization, but consider reviewing the order for the possibility of fraud." },
        { code: 201, message: "The issuing bank has questions about the request. You do not receive an authorization code programmatically, but you might receive one verbally by calling the processor.Possible action: Call your processor to possibly receive a verbal authorization. For contact phone numbers, refer to your merchant bank information." },
        { code: 202, message: "Expired card. You might also receive this value if the expiration date you provided does not match the date the issuing bank has on file.Possible action: Request a different card or other form of payment." },
        { code: 203, message: "General decline of the card. No other information was provided by the issuing bank.Possible action: Request a different card or other form of payment." },
        { code: 204, message: "Insufficient funds in the account.Possible action: Request a different card or other form of payment." },
        { code: 205, message: "Stolen or lost card.Possible action: Review this transaction manually to ensure that you submitted the correct information." },
        { code: 207, message: "Issuing bank unavailable.Possible action: Wait a few minutes and resend the request." },
        { code: 208, message: "Inactive card or card not authorized for card-not-present transactions.Possible action: Request a different card or other form of payment." },
        { code: 209, message: "CVN did not match.Possible action: Request a different card or other form of payment." },
        { code: 210, message: "The card has reached the credit limit.Possible action: Request a different card or other form of payment." },
        { code: 211, message: "Invalid CVN.Possible action: Request a different card or other form of payment." },
        { code: 221, message: "The customer matched an entry on the processor’s negative file.Possible action: Review the order and contact the payment processor." },
        { code: 230, message: "The authorization request was approved by the issuing bank but declined by CyberSource because it did not pass the CVN check.Possible action: You can capture the authorization, but consider reviewing the order for the possibility of fraud." },
        { code: 231, message: "Invalid account number.Possible action: Request a different card or other form of payment." },
        { code: 232, message: "The card type is not accepted by the payment processor.Possible action: Contact your merchant bank to confirm that your account is set up to receive the card in question." },
        { code: 233, message: "General decline by the processor.Possible action: Request a different card or other form of payment." },
        { code: 234, message: "There is a problem with the information in your CyberSource account.Possible action: Do not resend the request. Contact CyberSource Customer Support to correct the information in your account." },
        { code: 235, message: "The requested capture amount exceeds the originally authorized amount.Possible action: Issue a new authorization and capture request for the new amount." },
        { code: 236, message: "Processor failure.Possible action: Wait a few minutes and resend the request." },
        { code: 237, message: "The authorization has already been reversed.Possible action: No action required." },
        { code: 238, message: "The authorization has already been captured.Possible action: No action required." },
        { code: 239, message: "The requested transaction amount must match the previous transaction amount.Possible action: Correct the amount and resend the request." },
        { code: 240, message: "The card type sent is invalid or does not correlate with the payment card number.Possible action: Confirm that the card type correlates with the payment card number specified in the request, then resend the request." },
        { code: 241, message: "The request ID is invalid.Possible action: Request a new authorization, and if successful, proceed with the capture." },
        { code: 242, message: "You requested a capture, but there is no corresponding, unused authorization record. Occurs if there was not a previously successful authorization request or if the previously successful authorization has already been used by another capture request.Possible action: Request a new authorization, and if successful, proceed with the capture." },
        { code: 243, message: "The transaction has already been settled or reversed.Possible action: No action required." },
        { code: 246, message: "One of the following: The capture or credit is not voidable because the capture or credit information has already been submitted to your processor. - or - You requested a void for a type of transaction that cannot be voided. Possible action: No action required." },
        { code: 247, message: "You requested a credit for a capture that was previously voided.Possible action: No action required." },
        { code: 250, message: "The request was received, but there was a timeout at the payment processor.Possible action: To avoid duplicating the transaction, do not resend the request until you have reviewed the transaction status in the Business Center." },
        { code: 254, message: "Stand-alone credits are not allowed.Possible action: Submit a follow-on credit by including a request ID in the credit request. A follow-on credit must be requested within 60 days of the authorization. To process stand-alone credits, contact your CyberSource account representative to learn whether your processor supports stand-alone credits." },
        { code: 256, message: "Credit amount exceeds maximum allowed for your CyberSource account.Possible action: Contact CyberSource Customer Support or your acquirer for details."}
    ]

};


module.exports = applicationData;