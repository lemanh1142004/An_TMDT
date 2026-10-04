package com.fashionstore.backend.modules.chat.entity;

public enum ChatChannelType {
    CUSTOMER_SUPPORT, // Khách hàng <-> Cửa hàng (Cả Admin và Staff cùng xem và trả lời)
    INTERNAL          // Nội bộ cửa hàng (Nhân viên Staff <-> Quản trị viên Admin)
}
