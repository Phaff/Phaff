#[no_mangle]
pub extern fn hello_world() -> &'static str {
    return "Hello world";
}