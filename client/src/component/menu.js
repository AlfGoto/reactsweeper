import RestartButton from './restartButton.js'

export default function Menu() {
    function menuSlide(e){
        let menu = document.getElementById('menu')
        if(e.target != menu){return}
        if(menu.style.right == '0svw'){
            menu.style.right = '-15svw'
        } else {
            menu.style.right = '0svw'
        }
    }

    return (
        <div id='menu' onClick={menuSlide}>
                <RestartButton />
        </div>
    )
}