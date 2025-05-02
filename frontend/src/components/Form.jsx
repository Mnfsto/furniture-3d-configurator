export default Form = (props) => {




    return (

        <div>
            <form onSubmit={handleFormSubmit} className="request-form">
                <h3>Залишити запит</h3>
                <div>
                    <label>Ім'я:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                    />
                </div>
                <div>
                    <label>Телефон:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                    />
                </div>
                <div>
                    <label>Коментар:</label>
                    <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleFormChange}
                    />
                </div>
                <button type="submit" disabled={!screenshotBlob}>
                    Надіслати запит
                </button>
            </form>
        </div>

    )
}